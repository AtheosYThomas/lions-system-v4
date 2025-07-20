
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  line_user_id VARCHAR(255) UNIQUE,
  role VARCHAR(50) DEFAULT 'member',
  phone VARCHAR(50),
  english_name VARCHAR(255),
  birthday DATE NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  mobile VARCHAR(50) NOT NULL,
  fax VARCHAR(50),
  address TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
