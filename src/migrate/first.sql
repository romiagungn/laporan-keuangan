CREATE TABLE expenses (
                          id SERIAL PRIMARY KEY,
                          user_id TEXT NOT NULL,
                          date DATE NOT NULL,
                          category TEXT NOT NULL,
                          description TEXT,
                          amount DECIMAL(12, 2) NOT NULL,
                          payment_method TEXT,
                          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE users (
                       id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                       name TEXT,
                       email TEXT NOT NULL UNIQUE,
                       password TEXT NOT NULL,
                       created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (name, email, password) VALUES
    ('Romie', 'romie@example.com', '2a10$Y.iUi7f.frg4iK5j.x8/A.A2hJz1U/Xn7bV6.j7E.j3d2i4O.j2C');

INSERT INTO users (name, email, password) VALUES
    ('Lala', 'lala@example.com', '2a10$Y.iUi7f.frg4iK5j.x8/A.A2hJz1U/Xn7bV6.j7E.j3d2i4O.j2C');