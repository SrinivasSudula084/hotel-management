import jwt from "jsonwebtoken";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MjViNTFmMjMxZjljMGE1MzMyNWM1YyIsInJvbGUiOiJvd25lciIsImlhdCI6MTc2NDA4NTU3MH0.Wf-H4abh0lpcTl4urHpIUrYoIf0cjwBxi7dZ4Z9wHUA";
const secret = "mysupersecretkey";

try {
  const decoded = jwt.verify(token, secret);
  console.log("WORKING:", decoded);
} catch (err) {
  console.log("ERROR:", err.message);
}
