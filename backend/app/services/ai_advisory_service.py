"""
RainGuard AI – AI Advisory Service
=====================================
Uses GPT-6 Astra (via Experiential Labs) with:
  • Tool-calling  – the LLM can invoke get_flood_prediction,
                    get_realtime_weather, and get_location_info
  • Streaming     – returns an SSE-compatible async generator
"""

import json
from typing import Generator, Optional

from app.core.llm_client import get_llm_client, EXPLABS_MODEL
from app.ml.predictor import predictor
from app.services.realtime_service import get_realtime_weather, get_location_name

# ── System prompt ────────────────────────────────────────────────────────────

SYSTEM_PROMPT = (
    "You are RainGuard AI Advisor, an expert flood-risk analyst. "
    "You have access to tools that can fetch real-time weather data and run "
    "a machine-learning flood prediction model. Use them when the user asks "
    "about flood risk for a specific location.\n\n"
    "When providing advisories:\n"
    "1. State the risk level clearly (LOW / MODERATE / HIGH / CRITICAL).\n"
    "2. Cite the data sources your assessment is based on.\n"
    "3. Give actionable, specific recommendations.\n"
    "4. If you used a tool, summarise the key numbers it returned.\n"
    "Keep responses concise and well-structured."
)

# ── Tool definitions (OpenAI function-calling format) ────────────────────────

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_flood_prediction",
            "description": (
                "Run the RainGuard ML model to predict flood probability for "
                "given weather and terrain parameters."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "rainfall_1h":  {"type": "number", "description": "1-hour rainfall in mm"},
                    "rainfall_3h":  {"type": "number", "description": "3-hour rainfall in mm"},
                    "rainfall_6h":  {"type": "number", "description": "6-hour rainfall in mm"},
                    "rainfall_24h": {"type": "number", "description": "24-hour cumulative rainfall in mm"},
                    "temperature":  {"type": "number", "description": "Temperature in °C"},
                    "humidity":     {"type": "number", "description": "Relative humidity %"},
                    "wind_speed":   {"type": "number", "description": "Wind speed km/h"},
                    "elevation":    {"type": "number", "description": "Elevation in metres"},
                    "urbanization_factor": {"type": "number", "description": "0-1 urbanization fraction"},
                    "drainage_factor":     {"type": "number", "description": "0-1 drainage quality"},
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_realtime_weather",
            "description": "Fetch current weather and rainfall data for given coordinates from Open-Meteo.",
            "parameters": {
                "type": "object",
                "properties": {
                    "latitude":  {"type": "number", "description": "Latitude"},
                    "longitude": {"type": "number", "description": "Longitude"},
                },
                "required": ["latitude", "longitude"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_location_info",
            "description": "Reverse-geocode coordinates to get a human-readable location name.",
            "parameters": {
                "type": "object",
                "properties": {
                    "latitude":  {"type": "number", "description": "Latitude"},
                    "longitude": {"type": "number", "description": "Longitude"},
                },
                "required": ["latitude", "longitude"],
            },
        },
    },
]


# ── Tool execution ───────────────────────────────────────────────────────────

def _execute_tool_call(name: str, arguments: dict) -> str:
    """Execute a tool call and return the result as a JSON string."""
    if name == "get_flood_prediction":
        if not predictor.is_loaded():
            return json.dumps({"error": "ML model not loaded"})
        result = predictor.predict(arguments)
        return json.dumps(result)

    elif name == "get_realtime_weather":
        weather = get_realtime_weather(arguments["latitude"], arguments["longitude"])
        if weather is None:
            return json.dumps({"error": "Could not fetch weather data"})
        return json.dumps(weather)

    elif name == "get_location_info":
        name_str = get_location_name(arguments["latitude"], arguments["longitude"])
        return json.dumps({"location_name": name_str})

    return json.dumps({"error": f"Unknown tool: {name}"})


# ── Non-streaming advisory ───────────────────────────────────────────────────

def generate_advisory(
    question: str,
    location_name: Optional[str] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
) -> dict:
    """
    Generate a flood-risk advisory using GPT-6 Astra with tool-calling.
    Returns the final assistant message and any tool interactions.
    """
    client = get_llm_client()

    # Build the user message with location context
    user_content = question
    if location_name:
        user_content = f"[Location: {location_name}] {question}"
    if latitude is not None and longitude is not None:
        user_content += f" (Coordinates: {latitude}, {longitude})"

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]

    # Tool-calling loop: keep going until the model produces a final response
    max_iterations = 5
    tool_results = []

    for _ in range(max_iterations):
        response = client.chat.completions.create(
            model=EXPLABS_MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
        )

        choice = response.choices[0]

        # If the model wants to call tools, execute them and continue
        if choice.finish_reason == "tool_calls" and choice.message.tool_calls:
            messages.append(choice.message)

            for tool_call in choice.message.tool_calls:
                fn_name = tool_call.function.name
                fn_args = json.loads(tool_call.function.arguments)
                fn_result = _execute_tool_call(fn_name, fn_args)

                tool_results.append({
                    "tool": fn_name,
                    "arguments": fn_args,
                    "result": json.loads(fn_result),
                })

                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": fn_result,
                })
        else:
            # Final response from the model
            return {
                "advisory": choice.message.content,
                "model": EXPLABS_MODEL,
                "tool_calls": tool_results,
            }

    return {
        "advisory": "Advisory generation exceeded maximum tool-call iterations.",
        "model": EXPLABS_MODEL,
        "tool_calls": tool_results,
    }


# ── Streaming advisory ──────────────────────────────────────────────────────

def generate_advisory_stream(
    question: str,
    location_name: Optional[str] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
) -> Generator[str, None, None]:
    """
    Stream a flood-risk advisory as Server-Sent Events.

    Yields SSE-formatted strings:
      data: {"type": "token",     "content": "..."}
      data: {"type": "tool_call", "tool": "...", "result": {...}}
      data: {"type": "done"}
    """
    client = get_llm_client()

    user_content = question
    if location_name:
        user_content = f"[Location: {location_name}] {question}"
    if latitude is not None and longitude is not None:
        user_content += f" (Coordinates: {latitude}, {longitude})"

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]

    max_iterations = 5

    for _ in range(max_iterations):
        stream = client.chat.completions.create(
            model=EXPLABS_MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
            stream=True,
        )

        # Accumulate streamed chunks
        collected_content = ""
        collected_tool_calls: dict[int, dict] = {}
        finish_reason = None

        for chunk in stream:
            delta = chunk.choices[0].delta if chunk.choices else None
            finish_reason = chunk.choices[0].finish_reason if chunk.choices else None

            if delta is None:
                continue

            # Stream text tokens to the client immediately
            if delta.content:
                collected_content += delta.content
                yield f"data: {json.dumps({'type': 'token', 'content': delta.content})}\n\n"

            # Accumulate tool call deltas
            if delta.tool_calls:
                for tc_delta in delta.tool_calls:
                    idx = tc_delta.index
                    if idx not in collected_tool_calls:
                        collected_tool_calls[idx] = {
                            "id": "",
                            "name": "",
                            "arguments": "",
                        }
                    if tc_delta.id:
                        collected_tool_calls[idx]["id"] = tc_delta.id
                    if tc_delta.function:
                        if tc_delta.function.name:
                            collected_tool_calls[idx]["name"] = tc_delta.function.name
                        if tc_delta.function.arguments:
                            collected_tool_calls[idx]["arguments"] += tc_delta.function.arguments

        # If the model called tools, execute them and loop
        if finish_reason == "tool_calls" and collected_tool_calls:
            # Build the assistant message with tool_calls for the conversation
            from openai.types.chat import ChatCompletionMessage
            tool_calls_list = []
            for idx in sorted(collected_tool_calls.keys()):
                tc = collected_tool_calls[idx]
                tool_calls_list.append({
                    "id": tc["id"],
                    "type": "function",
                    "function": {
                        "name": tc["name"],
                        "arguments": tc["arguments"],
                    },
                })

            messages.append({
                "role": "assistant",
                "content": collected_content or None,
                "tool_calls": tool_calls_list,
            })

            for tc_info in tool_calls_list:
                fn_name = tc_info["function"]["name"]
                fn_args = json.loads(tc_info["function"]["arguments"])
                fn_result = _execute_tool_call(fn_name, fn_args)

                yield f"data: {json.dumps({'type': 'tool_call', 'tool': fn_name, 'result': json.loads(fn_result)})}\n\n"

                messages.append({
                    "role": "tool",
                    "tool_call_id": tc_info["id"],
                    "content": fn_result,
                })
        else:
            # Final response streamed — we're done
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
            return

    yield f"data: {json.dumps({'type': 'done'})}\n\n"
