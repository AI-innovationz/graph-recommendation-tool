from ollama import chat


class LLMClient:

    def __init__(self, model="llama3.2:3b"):
        self.model = model

    ######################################################

    def extract(self, text: str, prompt: str):

        final_prompt = prompt.replace("<<TEXT>>", text)

        response = chat(
            model=self.model,
            messages=[
                {
                    "role": "user",
                    "content": final_prompt
                }
            ]
        )

        return response.message.content