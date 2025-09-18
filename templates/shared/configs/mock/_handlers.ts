// MSW API handlers
import { http, HttpResponse } from "msw";

export const handlers = [
  // 示例API
  http.get("/api/users", () => {
    return HttpResponse.json([
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 2, name: "Jane Smith", email: "jane@example.com" },
    ]);
  }),

  http.post("/api/users", async ({ request }) => {
    const newUser = await request.json();
    return HttpResponse.json({ id: Date.now(), ...newUser }, { status: 201 });
  }),

  http.get("/api/users/:id", ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id: Number(id),
      name: "User " + id,
      email: `user${id}@example.com`,
    });
  }),
];
