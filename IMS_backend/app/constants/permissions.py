class PERMISSIONS:
    class USER:
        READ = "user:read"
        UPDATE = "user:update"
        DELETE = "user:delete"

    class ROLE:
        READ = "role:read"
        UPDATE = "role:update"

    class INTERNSHIP:
        READ = "internship:read"
        CREATE = "internship:create"
        UPDATE = "internship:update"
        DELETE = "internship:delete"

    class PROJECT:
        READ = "project:read"
        CREATE = "project:create"
        UPDATE = "project:update"
        DELETE = "project:delete"

    class TASK:
        READ = "task:read"
        CREATE = "task:create"
        UPDATE = "task:update"
        DELETE = "task:delete"

    class REPORT:
        READ = "report:read"
        CREATE = "report:create"
        UPDATE = "report:update"
        DELETE = "report:delete"

    class BLOCKER:
        READ = "blocker:read"
        CREATE = "blocker:create"
        UPDATE = "blocker:update"
        DELETE = "blocker:delete"

    class FEEDBACK:
        READ = "feedback:read"
        CREATE = "feedback:create"
        UPDATE = "feedback:update"
        DELETE = "feedback:delete"

    class EVALUATION:
        READ = "evaluation:read"
        CREATE = "evaluation:create"
        UPDATE = "evaluation:update"
        DELETE = "evaluation:delete"

    class AI:
        SUMMARIZE = "ai:summarize"
        CHAT = "ai:chat"
        ADMIN_ANALYTICS = "ai:admin_analytics"
