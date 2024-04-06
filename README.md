# Story and Image Generator

This application combines two AI models to generate stories and images based on user prompts. It uses Cloudflare Workers to serve the HTML content and handle requests for generating stories and images.

## Demo page

[Story and Image Generator](https://story-tell-api.bobbyiliev.workers.dev/)

![](https://imgur.com/Ax7c9fZ.gif)

## Features

- Generate stories and images by providing a prompt.
- Displays the story and initial image side by side.
- Uses two AI models:
  - Story generation: `@hf/thebloke/llama-2-13b-chat-awq`
  - Image generation: `@cf/bytedance/stable-diffusion-xl-lightning`
- Includes a loading indicator while content is being generated.
- Uses eventstream to stream the generated content to the client in real-time.

## How to Deploy

To deploy the application, follow these steps:

1. Install [Wrangler](https://developers.cloudflare.com/workers/cli-wrangler/install-update).
2. Log in to Wrangler: `wrangler login`.
3. Create a new Cloudflare Workers project or navigate to an existing project directory.
4. Replace the existing code in your project with the provided code.
5. Deploy the project using Wrangler: `wrangler publish`.

## How to Run Locally

You can also run the application locally for testing purposes:

1. Install Wrangler if you haven't already.
2. Navigate to the project directory.
3. Run the project locally using Wrangler: `wrangler dev`.
4. Open your browser and navigate to the local URL provided by Wrangler.

## Usage

Once the application is deployed, users can access it through the provided URL. They can then enter a prompt in the input field and click "Generate" to create an story and image. The generated content will be displayed on the page.

## Useful Links

- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Cloudflare AI Models](https://developers.cloudflare.com/workers-ai/models)
