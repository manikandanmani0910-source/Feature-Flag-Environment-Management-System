from enum import Enum


class EnvironmentType(str, Enum):
    DEVELOPMENT = "development"
    TESTING = "testing"
    PRODUCTION = "production"


class FeatureStatus(str, Enum):
    ENABLED = "enabled"
    DISABLED = "disabled"


class RolloutType(str, Enum):
    PERCENTAGE = "percentage"
    USER_TARGETING = "user_targeting"


class ScheduleStatus(str, Enum):
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class AuditAction(str, Enum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    ENABLE = "enable"
    DISABLE = "disable"
    ROLLBACK = "rollback"
    ASSIGN = "assign"
    UNASSIGN = "unassign"
    LOGIN = "login"
    LOGOUT = "logout"