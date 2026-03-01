const fs = require("node:fs");
const path = require("node:path");

function createModule(moduleName) {
  const modulePath = path.join(__dirname, "src", "modules", moduleName);

  if (fs.existsSync(modulePath)) {
    console.error(`Module "${moduleName}" already exists.`);
    return;
  }

  fs.mkdirSync(modulePath, { recursive: true });
  const files = [
    `${moduleName}.type.ts`,
    `${moduleName}.interface.ts`,
    `${moduleName}.controller.ts`,
    `${moduleName}.route.ts`,
    `${moduleName}.repository.ts`,
    `${moduleName}.service.ts`,
    `${moduleName}.model.ts`,
    `${moduleName}.schema.ts`,
    `${moduleName}.utils.ts`,
  ];

  files.forEach((fileName) => {
    const filePath = path.join(modulePath, fileName);
    fs.writeFileSync(filePath, "");
  });

  console.log(
    `Module "${moduleName}" has been created successfully with empty files.`
  );
}

const moduleName = process.argv[2];
if (!moduleName) {
  console.error("Please provide a module name.");
  process.exit(1);
}

createModule(moduleName);
