class ApplicationException(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = 500,
        error_code: str = "APPLICATION_ERROR",
    ) -> None:
        self.message = message
        self.status_code = status_code
        self.error_code = error_code

        super().__init__(message)


class ResourceNotFoundException(ApplicationException):
    def __init__(
        self,
        resource: str,
        identifier: str | int,
    ) -> None:
        super().__init__(
            message=f"{resource} with id '{identifier}' was not found",
            status_code=404,
            error_code="RESOURCE_NOT_FOUND",
        )


class ResourceConflictException(ApplicationException):
    def __init__(self, message: str) -> None:
        super().__init__(
            message=message,
            status_code=409,
            error_code="RESOURCE_CONFLICT",
        )


class AuthenticationException(ApplicationException):
    def __init__(
        self,
        message: str = "Authentication failed",
    ) -> None:
        super().__init__(
            message=message,
            status_code=401,
            error_code="AUTHENTICATION_FAILED",
        )


class AuthorizationException(ApplicationException):
    def __init__(
        self,
        message: str = "You do not have permission to perform this action",
    ) -> None:
        super().__init__(
            message=message,
            status_code=403,
            error_code="AUTHORIZATION_FAILED",
        )


class ValidationException(ApplicationException):
    def __init__(self, message: str) -> None:
        super().__init__(
            message=message,
            status_code=422,
            error_code="VALIDATION_ERROR",
        )