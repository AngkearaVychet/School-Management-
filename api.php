<?php
/**
 * កម្មវិធីគ្រប់គ្រងព័ត៌មាន និងចុះឈ្មោះសិស្ស - API Server (SQLite Database Backend)
 * Hampton International School Management & Gradebook API
 */

session_start([
    'cookie_httponly' => true,
    'cookie_samesite' => 'Lax'
]);

header('Content-Type: application/json; charset=utf-8');

// Determine data directory
$dataDir = getenv('GRADEBOOK_DATA_DIR');
if (!$dataDir) {
    $parent = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'gradebook-data';
    if (@is_dir($parent) || @mkdir($parent, 0755, true)) {
        $dataDir = $parent;
    } else {
        $dataDir = __DIR__ . DIRECTORY_SEPARATOR . 'data';
        if (!is_dir($dataDir)) {
            @mkdir($dataDir, 0755, true);
        }
    }
}

$dbFile = $dataDir . DIRECTORY_SEPARATOR . 'gradebook.sqlite';

try {
    $pdo = new PDO("sqlite:" . $dbFile, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    $pdo->exec("PRAGMA journal_mode = WAL;");
    $pdo->exec("PRAGMA synchronous = NORMAL;");

    // Initialize tables
    $pdo->exec("CREATE TABLE IF NOT EXISTS docs (
        path TEXT PRIMARY KEY,
        collection TEXT,
        doc_id TEXT,
        data TEXT,
        version TEXT,
        updated_at INTEGER
    );");

    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_docs_coll ON docs(collection);");

    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password_hash TEXT,
        name TEXT,
        role TEXT,
        classes TEXT,
        branches TEXT,
        depts TEXT,
        created_at INTEGER
    );");
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database initialization failed: ' . $e->getMessage()]);
    exit;
}

// Helper functions
function getJsonBody() {
    $raw = file_get_contents('php://input');
    return $raw ? json_decode($raw, true) : [];
}

function currentUser() {
    return $_SESSION['user'] ?? null;
}

function requireAuth() {
    $u = currentUser();
    if (!$u) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthenticated']);
        exit;
    }
    return $u;
}

function requireAdmin() {
    $u = requireAuth();
    if ($u['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Permission denied (Admin required)']);
        exit;
    }
    return $u;
}

$action = $_GET['a'] ?? 'me';

switch ($action) {
    case 'me':
        $u = currentUser();
        $adminCount = $pdo->query("SELECT COUNT(*) FROM users WHERE role='admin'")->fetchColumn();
        echo json_encode([
            'user' => $u,
            'needsSetup' => ($adminCount == 0)
        ]);
        break;

    case 'setup':
        $adminCount = $pdo->query("SELECT COUNT(*) FROM users WHERE role='admin'")->fetchColumn();
        if ($adminCount > 0) {
            http_response_code(403);
            echo json_encode(['error' => 'System already set up']);
            exit;
        }
        $body = getJsonBody();
        $username = trim($body['username'] ?? '');
        $password = $body['password'] ?? '';
        $name = trim($body['name'] ?? 'Admin');

        if (!$username || strlen($password) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid username or password (minimum 6 chars)']);
            exit;
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (username, password_hash, name, role, classes, branches, depts, created_at) VALUES (?, ?, ?, 'admin', '[]', '[]', '[]', ?)");
        $stmt->execute([$username, $hash, $name, time()]);

        $user = [
            'username' => $username,
            'name' => $name,
            'role' => 'admin',
            'classes' => [],
            'branches' => [],
            'depts' => []
        ];
        $_SESSION['user'] = $user;
        echo json_encode(['user' => $user]);
        break;

    case 'login':
        $body = getJsonBody();
        $username = trim($body['username'] ?? '');
        $password = $body['password'] ?? '';

        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $row = $stmt->fetch();

        if ($row && password_verify($password, $row['password_hash'])) {
            $user = [
                'username' => $row['username'],
                'name' => $row['name'],
                'role' => $row['role'],
                'classes' => json_decode($row['classes'] ?: '[]', true),
                'branches' => json_decode($row['branches'] ?: '[]', true),
                'depts' => json_decode($row['depts'] ?: '[]', true)
            ];
            $_SESSION['user'] = $user;
            echo json_encode(['user' => $user]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'ឈ្មោះអ្នកប្រើ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវឡើយ']);
        }
        break;

    case 'logout':
        session_destroy();
        echo json_encode(['ok' => true]);
        break;

    case 'get':
        $p = $_GET['p'] ?? '';
        $clientVer = $_GET['v'] ?? '';
        $stmt = $pdo->prepare("SELECT data, version FROM docs WHERE path = ?");
        $stmt->execute([$p]);
        $doc = $stmt->fetch();

        if (!$doc) {
            echo json_encode(['data' => null, 'v' => '']);
            exit;
        }
        if ($clientVer && $clientVer === $doc['version']) {
            echo json_encode(['same' => true]);
            exit;
        }
        echo json_encode([
            'data' => json_decode($doc['data'], true),
            'v' => $doc['version']
        ]);
        break;

    case 'getmany':
        $body = getJsonBody();
        $paths = $body['paths'] ?? [];
        $result = [];
        if (!empty($paths)) {
            $in = str_repeat('?,', count($paths) - 1) . '?';
            $stmt = $pdo->prepare("SELECT path, data FROM docs WHERE path IN ($in)");
            $stmt->execute($paths);
            while ($row = $stmt->fetch()) {
                $result[$row['path']] = json_decode($row['data'], true);
            }
        }
        echo json_encode(['docs' => $result]);
        break;

    case 'list':
        $c = $_GET['c'] ?? '';
        $clientVer = $_GET['v'] ?? '';
        $stmt = $pdo->prepare("SELECT doc_id, data, version FROM docs WHERE collection = ?");
        $stmt->execute([$c]);
        $rows = $stmt->fetchAll();
        $combinedVer = md5(implode('', array_column($rows, 'version')));

        if ($clientVer && $clientVer === $combinedVer) {
            echo json_encode(['same' => true]);
            exit;
        }

        $docs = [];
        foreach ($rows as $r) {
            $docs[] = [
                'id' => $r['doc_id'],
                'data' => json_decode($r['data'], true)
            ];
        }
        echo json_encode(['docs' => $docs, 'v' => $combinedVer]);
        break;

    case 'set':
        requireAuth();
        $body = getJsonBody();
        $p = $body['p'] ?? '';
        $data = $body['data'] ?? null;
        if (!$p) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing path']);
            exit;
        }

        $parts = explode('/', $p, 2);
        $coll = $parts[0] ?? '';
        $docId = $parts[1] ?? '';
        $json = json_encode($data, JSON_UNESCAPED_UNICODE);
        $ver = md5($json);

        $stmt = $pdo->prepare("INSERT INTO docs (path, collection, doc_id, data, version, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(path) DO UPDATE SET data=excluded.data, version=excluded.version, updated_at=excluded.updated_at");
        $stmt->execute([$p, $coll, $docId, $json, $ver, time()]);
        echo json_encode(['ok' => true, 'v' => $ver]);
        break;

    case 'patch':
        requireAuth();
        $body = getJsonBody();
        $p = $body['p'] ?? '';
        $patchData = $body['data'] ?? [];
        if (!$p) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing path']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT data FROM docs WHERE path = ?");
        $stmt->execute([$p]);
        $existingRow = $stmt->fetch();
        $existing = $existingRow ? json_decode($existingRow['data'], true) : [];

        // Deep merge
        $merge = function($a, $b) use (&$merge) {
            foreach ($b as $k => $v) {
                if (is_array($v) && isset($a[$k]) && is_array($a[$k]) && !array_is_list($v)) {
                    $a[$k] = $merge($a[$k], $v);
                } else {
                    $a[$k] = $v;
                }
            }
            return $a;
        };

        $merged = $merge($existing ?: [], $patchData);
        $parts = explode('/', $p, 2);
        $coll = $parts[0] ?? '';
        $docId = $parts[1] ?? '';
        $json = json_encode($merged, JSON_UNESCAPED_UNICODE);
        $ver = md5($json);

        $stmt = $pdo->prepare("INSERT INTO docs (path, collection, doc_id, data, version, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(path) DO UPDATE SET data=excluded.data, version=excluded.version, updated_at=excluded.updated_at");
        $stmt->execute([$p, $coll, $docId, $json, $ver, time()]);
        echo json_encode(['ok' => true, 'v' => $ver]);
        break;

    case 'del':
        requireAuth();
        $body = getJsonBody();
        $p = $body['p'] ?? '';
        if ($p) {
            $stmt = $pdo->prepare("DELETE FROM docs WHERE path = ?");
            $stmt->execute([$p]);
        }
        echo json_encode(['ok' => true]);
        break;

    case 'users':
        requireAdmin();
        $stmt = $pdo->query("SELECT username, name, role, classes, branches, depts FROM users ORDER BY rowid");
        $users = [];
        while ($r = $stmt->fetch()) {
            $users[] = [
                'username' => $r['username'],
                'name' => $r['name'],
                'role' => $r['role'],
                'classes' => json_decode($r['classes'] ?: '[]', true),
                'branches' => json_decode($r['branches'] ?: '[]', true),
                'depts' => json_decode($r['depts'] ?: '[]', true)
            ];
        }
        echo json_encode(['users' => $users]);
        break;

    case 'user_save':
        requireAdmin();
        $body = getJsonBody();
        $username = trim($body['username'] ?? '');
        $name = trim($body['name'] ?? '');
        $password = $body['password'] ?? '';
        $role = $body['role'] ?? 'teacher';
        $classes = json_encode($body['classes'] ?? []);
        $branches = json_encode($body['branches'] ?? []);
        $depts = json_encode($body['depts'] ?? []);

        if (!$username || !$name) {
            http_response_code(400);
            echo json_encode(['error' => 'Name and username required']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $existing = $stmt->fetch();

        if ($existing) {
            if ($password) {
                $hash = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("UPDATE users SET name=?, password_hash=?, role=?, classes=?, branches=?, depts=? WHERE username=?");
                $stmt->execute([$name, $hash, $role, $classes, $branches, $depts, $username]);
            } else {
                $stmt = $pdo->prepare("UPDATE users SET name=?, role=?, classes=?, branches=?, depts=? WHERE username=?");
                $stmt->execute([$name, $role, $classes, $branches, $depts, $username]);
            }
        } else {
            if (!$password || strlen($password) < 6) {
                http_response_code(400);
                echo json_encode(['error' => 'Password must be at least 6 characters']);
                exit;
            }
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO users (username, password_hash, name, role, classes, branches, depts, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$username, $hash, $name, $role, $classes, $branches, $depts, time()]);
        }

        // Return updated list
        $stmt = $pdo->query("SELECT username, name, role, classes, branches, depts FROM users ORDER BY rowid");
        $users = [];
        while ($r = $stmt->fetch()) {
            $users[] = [
                'username' => $r['username'],
                'name' => $r['name'],
                'role' => $r['role'],
                'classes' => json_decode($r['classes'] ?: '[]', true),
                'branches' => json_decode($r['branches'] ?: '[]', true),
                'depts' => json_decode($r['depts'] ?: '[]', true)
            ];
        }
        echo json_encode(['ok' => true, 'users' => $users]);
        break;

    case 'user_del':
        requireAdmin();
        $body = getJsonBody();
        $username = trim($body['username'] ?? '');
        $curr = currentUser();

        if ($curr['username'] === $username) {
            http_response_code(400);
            echo json_encode(['error' => 'Cannot delete your own account']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM users WHERE username = ?");
        $stmt->execute([$username]);

        $stmt = $pdo->query("SELECT username, name, role, classes, branches, depts FROM users ORDER BY rowid");
        $users = [];
        while ($r = $stmt->fetch()) {
            $users[] = [
                'username' => $r['username'],
                'name' => $r['name'],
                'role' => $r['role'],
                'classes' => json_decode($r['classes'] ?: '[]', true),
                'branches' => json_decode($r['branches'] ?: '[]', true),
                'depts' => json_decode($r['depts'] ?: '[]', true)
            ];
        }
        echo json_encode(['ok' => true, 'users' => $users]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Unknown action']);
        break;
}
