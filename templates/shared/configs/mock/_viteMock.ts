// vite-plugin-mock配置
export default [
  {
    url: "/api/users",
    method: "get",
    response: () => {
      return {
        code: 200,
        data: [
          { id: 1, name: "John Doe", email: "john@example.com" },
          { id: 2, name: "Jane Smith", email: "jane@example.com" },
        ],
        message: "success",
      };
    },
  },
  {
    url: "/api/users",
    method: "post",
    response: ({ body }) => {
      return {
        code: 200,
        data: { id: Date.now(), ...body },
        message: "success",
      };
    },
  },
  {
    url: "/api/users/:id",
    method: "get",
    response: ({ query }) => {
      return {
        code: 200,
        data: {
          id: Number(query.id),
          name: `User ${query.id}`,
          email: `user${query.id}@example.com`,
        },
        message: "success",
      };
    },
  },
];
