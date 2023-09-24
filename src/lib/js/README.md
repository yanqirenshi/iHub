
        +---------------------------------+
        | Loader                          |
        |=================================|
        | _token                          |
        | _viewer                         |
        |---------------------------------|
        | fetch (query, success, error)   |
        | connect (token, success, error) |
        | isConnected ()                  |
        | token (v)                       |
        +---------------------------------+
             ^
             |
             |
        +-------------------------+
        | Pooler                  |
        |=========================|
        | matchmaker              |
        | _pools                  |
        |-------------------------|
        | pool (v)                |
        | get (id)                |
        | node2repository (node)  |
        | repository (v)          |
        | node2user (node)        |
        | user (v)                |
        | node2projectV2 (node)   |
        | projectV2 (v)           |
        +-------------------------+
             ^
             |
             |
        +------------------------------------------+
        | Sogh                                     |
        |==========================================|
        |                                          |
        |                                          |
        |------------------------------------------|
        | href (obj, to, data)                     |
        |- - - - - - - - - - - - - - - - - - - - - |
        | fetchRepositoriesByViewer (success, error|
        | fetchUserByID (id)                       |
        | fetchProjectsNextByUser (user)           |
        | fetchProjectsNextByID (id)               |
        +------------------------------------------+
