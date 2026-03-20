migrate(
  (app) => {
    const collection = new Collection({
      name: "project_members",
      type: "base",
      fields: [
        {
          name: "user_id",
          type: "relation",
          required: true,
          options: {
            collectionId: "users",
            cascadeDelete: true,
            maxSelect: 1,
            minSelect: 1,
          },
        },
        {
          name: "project_id",
          type: "relation",
          required: true,
          options: {
            collectionId: "projects",
            cascadeDelete: true,
            maxSelect: 1,
            minSelect: 1,
          },
        },
        {
          name: "role",
          type: "select",
          required: false,
          options: {
            values: ["member", "admin", "owner"],
            maxSelect: 1,
          },
        },
        {
          name: "joined_at",
          type: "autodate",
          onCreate: true,
          onUpdate: false,
        },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_unique_membership ON project_members (user_id, project_id)',
      ],
    });

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("project_members");
    return app.delete(collection);
  }
);
