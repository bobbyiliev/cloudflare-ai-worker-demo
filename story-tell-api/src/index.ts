import { Ai } from "@cloudflare/ai";

export interface Env {
  AI: Ai;
}

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interactive Story and Image Generator</title>
</head>
<body>
    <h1>Interactive Story and Image Generator</h1>

    <div id="story-generator">
        <h2>Story Generator</h2>
        <input type="text" id="story-input" placeholder="Enter a prompt for the story">
        <button id="generate-story">Generate Story</button>
        <div id="story-output"></div>
    </div>

    <div id="image-generator">
        <h2>Image Generator</h2>
        <input type="text" id="image-prompt" placeholder="Enter a prompt for the image">
        <button id="generate-image">Generate Image</button>
        <img id="generated-image" src="" alt="" style="max-width: 500px; display: none;">
    </div>

    <script>
        document.getElementById('generate-story').addEventListener('click', function() {
            const userInput = document.getElementById('story-input').value;
            fetch('/story', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userInput })
            })
            .then(response => response.text())
            .then(data => {
                document.getElementById('story-output').textContent = data;
            });
        });

        document.getElementById('generate-image').addEventListener('click', function() {
            const prompt = document.getElementById('image-prompt').value;
            fetch('/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            })
            .then(response => response.blob())
            .then(blob => {
                const imageUrl = URL.createObjectURL(blob);
                const imageElement = document.getElementById('generated-image');
                imageElement.src = imageUrl;
                imageElement.style.display = 'block';
            });
        });
    </script>
</body>
</html>
`;

export default {
  async fetch(request: Request, env: Env) {
    const ai = new Ai(env.AI);
    const url = new URL(request.url);

    // Serve the HTML content when the root is accessed
    if (url.pathname === "/") {
      return new Response(htmlContent, {
        headers: {
          "content-type": "text/html",
        },
      });
    }

    // Endpoint for generating and streaming a story
    if (url.pathname === "/story") {
      if (request.method === "POST" && request.headers.get("Content-Type") === "application/json") {
        const { userInput } = await request.json();

        const messages = [
          { role: "system", content: "Tell a story for good night" },
          {
            role: "user",
            content: userInput || "Once upon a time, there was a little llama named Llama-2-13b",
          },
        ];

        const stream = await ai.run("@hf/thebloke/llama-2-13b-chat-awq", {
          messages,
          stream: true,
        });

        return new Response(stream, {
          headers: { "content-type": "text/event-stream" },
        });
      } else {
        return new Response("This endpoint expects a POST request with JSON payload.", { status: 400 });
      }
    }

    // Endpoint for generating an image based on the input
    else if (url.pathname === "/generate-image") {
      if (request.method === "POST" && request.headers.get("Content-Type") === "application/json") {
        const { prompt } = await request.json();

        const inputs = {
          prompt: prompt || "cyberpunk cat",
        };

        const response = await ai.run(
          "@cf/bytedance/stable-diffusion-xl-lightning",
          inputs
        );

        return new Response(response, {
          headers: {
            "content-type": "image/png",
          },
        });
      } else {
        return new Response("This endpoint expects a POST request with JSON payload.", { status: 400 });
      }
    }

    // Handle requests to unknown endpoints
    return new Response("Endpoint not found.", { status: 404 });
  },
};
