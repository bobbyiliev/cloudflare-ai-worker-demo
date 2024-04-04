import { Ai } from '@cloudflare/ai';

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
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
	<div class="container mx-auto px-4 py-12">
		<h1 class="text-4xl font-bold text-center mb-10 text-blue-600">Interactive Story and Image Generator</h1>

		<div id="generator" class="mb-12">
			<h2 class="text-3xl font-bold mb-4 text-gray-800">Generate Story and Image</h2>
			<div class="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 md:items-center">
				<input type="text" id="input-prompt" placeholder="Enter a prompt for the story and image" class="flex-1 px-4 py-3 border rounded shadow">
				<button id="generate-both" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded shadow-lg">Generate</button>
			</div>
		</div>

		<div id="loader" class="text-center hidden mb-6">
			<p class="text-lg font-semibold">Generating content, please wait...</p>
		</div>

		<div id="story-output-container" class="mb-8 hidden shadow-lg rounded-lg overflow-hidden">
			<h2 class="text-2xl font-bold mb-3 bg-blue-500 text-white p-4">Story Output</h2>
			<div class="flex flex-col md:flex-row md:space-x-4 p-4 bg-gray-100">
				<div id="story-output" class="bg-white p-6 border-t border-gray-200 md:w-1/2" style="height: full; overflow-y: auto;"></div>
				<img id="generated-image" src="https://via.placeholder.com/735x735?text=Generating..." alt="" class="w-full md:w-1/2 rounded-lg shadow-lg">
			</div>
		</div>
	</div>

    <script>
    document.getElementById('generate-both').addEventListener('click', function() {
        const prompt = document.getElementById('input-prompt').value;
        document.getElementById('loader').classList.remove('hidden');

        const storyEventSource = new EventSource('/story?prompt=' + encodeURIComponent(prompt));
        let completeStory = '';

        storyEventSource.onmessage = function(event) {
            if (event.data === '[DONE]') {
                storyEventSource.close();
                document.getElementById('loader').classList.add('hidden');
                return;
            }

            document.getElementById('story-output-container').classList.remove('hidden');
			// Add placehoder image while the actual image is being generated
            const data = JSON.parse(event.data);
            if (data && data.response) {
                document.getElementById('story-output').textContent += data.response;
                completeStory += data.response;
            }
        };

        // Start the first image generation immediately
        fetchImage('/generate-image', prompt, 'generated-image');
    });

    function fetchImage(endpoint, prompt, imageId) {
        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        })
        .then(response => response.blob())
        .then(blob => {
            const imageUrl = URL.createObjectURL(blob);
            const imageElement = document.getElementById(imageId);
            imageElement.src = imageUrl;
            imageElement.style.display = 'block';
        });
    }
    </script>
</body>
</html>
`;

export default {
	async fetch(request: Request, env: Env) {
		const ai = new Ai(env.AI);
		const url = new URL(request.url);

		if (url.pathname === '/') {
			return new Response(htmlContent, {
				headers: {
					'content-type': 'text/html',
				},
			});
		}

		if (url.pathname === '/story') {
			if (request.method === 'GET') {
				const userInput = url.searchParams.get('prompt') || 'Once upon a time, there was a little llama named Llama-2-13b';

				const messages = [
					{ role: 'system', content: 'Tell a story' },
					{ role: 'user', content: userInput },
				];

				const stream = await ai.run('@hf/thebloke/llama-2-13b-chat-awq', {
					messages,
					stream: true,
				});

				return new Response(stream, {
					headers: { 'content-type': 'text/event-stream' },
				});
			} else {
				return new Response('This endpoint expects a GET request.', { status: 400 });
			}
		}

		else if (url.pathname === '/generate-image') {
			if (request.method === 'POST' && request.headers.get('Content-Type') === 'application/json') {
				const { prompt } = await request.json();

				const inputs = {
					prompt: prompt || 'cyberpunk cat',
				};

				const response = await ai.run('@cf/bytedance/stable-diffusion-xl-lightning', inputs);

				return new Response(response, {
					headers: {
						'content-type': 'image/png',
					},
				});
			} else {
				return new Response('This endpoint expects a POST request with JSON payload.', { status: 400 });
			}
		}

		return new Response('Endpoint not found.', { status: 404 });
	},
};
