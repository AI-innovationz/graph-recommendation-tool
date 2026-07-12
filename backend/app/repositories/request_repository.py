from app.models.request import Request


class RequestRepository:
    def __init__(self):
        self.requests: list[Request] = []

    def add(self, request: Request):
        self.requests.append(request)

    def get_all(self) -> list[Request]:
        return self.requests
    
    def get_by_id(self,request_id:str)->Request|None:
        for request in self.requests:
            if str(request_id) == request_id:
                return request
        return None

        