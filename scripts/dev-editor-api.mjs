import { createServer } from 'node:http';
import { copyFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDataDir = path.join(rootDir, 'public', 'data');

const entities = {
  'home-topics': path.join(publicDataDir, 'home-topics.json'),
  'story-data': path.join(publicDataDir, 'story-data.json'),
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    const routeMatch = url.pathname.match(/^\/api\/editor\/([a-z-]+)$/);

    if (!routeMatch) {
      return sendJson(response, 404, { error: 'Not found' });
    }

    const entity = routeMatch[1];
    const filePath = entities[entity];

    if (!filePath) {
      return sendJson(response, 404, { error: 'Unknown editor entity' });
    }

    if (request.method === 'GET') {
      return sendJson(response, 200, await loadJson(filePath));
    }

    if (request.method === 'POST') {
      const payload = await readRequestJson(request);
      validateEntityPayload(entity, payload);

      const backupPath = await createBackup(entity, filePath);
      const formatted = JSON.stringify(payload, null, 2) + '\n';
      const tempPath = `${filePath}.tmp`;

      await writeFile(tempPath, formatted, 'utf8');
      await rename(tempPath, filePath);

      return sendJson(response, 200, {
        entity,
        filePath: path.relative(rootDir, filePath),
        backupPath: path.relative(rootDir, backupPath),
        savedAt: new Date().toISOString(),
      });
    }

    return sendJson(response, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(response, 400, {
      error: error instanceof Error ? error.message : 'Unexpected error',
    });
  }
});

server.listen(3100, '127.0.0.1', () => {
  process.stdout.write('Dev editor API listening on http://127.0.0.1:3100\n');
});

const stop = () => server.close(() => process.exit(0));
process.on('SIGINT', stop);
process.on('SIGTERM', stop);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(payload));
}

async function loadJson(filePath) {
  const content = await readFile(filePath, 'utf8');
  return JSON.parse(content);
}

async function readRequestJson(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const body = Buffer.concat(chunks).toString('utf8').trim();

  if (!body) {
    throw new Error('Request body is empty');
  }

  return JSON.parse(body);
}

async function createBackup(entity, filePath) {
  const backupDir = path.join(publicDataDir, '.backups', entity);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(
    backupDir,
    `${path.basename(filePath, '.json')}.${timestamp}.bak.json`,
  );

  await mkdir(backupDir, { recursive: true });
  await copyFile(filePath, backupPath);

  return backupPath;
}

function validateEntityPayload(entity, payload) {
  if (entity === 'home-topics') {
    validateHomeTopics(payload);
    return;
  }

  if (entity === 'story-data') {
    validateStoryData(payload);
    return;
  }

  throw new Error(`Validation is not configured for entity "${entity}"`);
}

function validateHomeTopics(payload) {
  if (!Array.isArray(payload)) {
    throw new Error('home-topics payload must be an array');
  }

  payload.forEach((topic, index) => validateTopic(topic, `home-topics[${index}]`));
}

function validateStoryData(payload) {
  assertObject(payload, 'story-data');
  assertArray(payload.scenes, 'story-data.scenes');
  assertArray(payload.mapObjects, 'story-data.mapObjects');

  payload.scenes.forEach((scene, index) => validateScene(scene, `story-data.scenes[${index}]`));
  payload.mapObjects.forEach((mapObject, index) =>
    validateMapObject(mapObject, `story-data.mapObjects[${index}]`),
  );
}

function validateTopic(topic, scope) {
  assertObject(topic, scope);
  assertRequiredString(topic.id, `${scope}.id`);
  assertRequiredString(topic.name, `${scope}.name`);
  assertRequiredString(topic.description, `${scope}.description`);
  assertRequiredString(topic.sceneId, `${scope}.sceneId`);
  assertFiniteNumber(topic.zoom, `${scope}.zoom`);
  assertCoordinateTuple(topic.center, `${scope}.center`);
  assertArray(topic.polyline, `${scope}.polyline`);
  assertArray(topic.polygons, `${scope}.polygons`);
  assertArray(topic.labels, `${scope}.labels`);

  topic.polyline.forEach((item, index) => validateShape(item, `${scope}.polyline[${index}]`, 2));
  topic.polygons.forEach((item, index) => validateShape(item, `${scope}.polygons[${index}]`, 3));
  topic.labels.forEach((label, index) => validateLabel(label, `${scope}.labels[${index}]`));
}

function validateShape(shape, scope, minPoints) {
  assertObject(shape, scope);
  assertRequiredString(shape.id, `${scope}.id`);
  assertRequiredString(shape.name, `${scope}.name`);
  assertRequiredString(shape.description, `${scope}.description`);
  assertArray(shape.points, `${scope}.points`);

  if (shape.points.length < minPoints) {
    throw new Error(`${scope}.points must contain at least ${minPoints} points`);
  }

  shape.points.forEach((point, index) => assertCoordinateTuple(point, `${scope}.points[${index}]`));
}

function validateLabel(label, scope) {
  assertObject(label, scope);
  assertRequiredString(label.id, `${scope}.id`);
  assertRequiredString(label.name, `${scope}.name`);
  assertRequiredString(label.description, `${scope}.description`);
  assertCoordinateTuple(label.position, `${scope}.position`);
}

function validateScene(scene, scope) {
  assertObject(scene, scope);
  assertRequiredString(scene.id, `${scope}.id`);
  assertRequiredString(scene.title, `${scope}.title`);
  assertRequiredString(scene.period, `${scope}.period`);
  assertArray(scene.tags, `${scope}.tags`);
  assertRequiredString(scene.text, `${scope}.text`);

  scene.tags.forEach((tag, index) => assertRequiredString(tag, `${scope}.tags[${index}]`));

  if (scene.paragraphs !== undefined) {
    assertArray(scene.paragraphs, `${scope}.paragraphs`);
    scene.paragraphs.forEach((paragraph, index) =>
      validateParagraph(paragraph, `${scope}.paragraphs[${index}]`),
    );
  }
}

function validateParagraph(paragraph, scope) {
  assertObject(paragraph, scope);
  assertRequiredString(paragraph.id, `${scope}.id`);
  assertRequiredString(paragraph.path, `${scope}.path`);
  assertRequiredString(paragraph.title, `${scope}.title`);
  assertString(paragraph.text, `${scope}.text`);
  assertArray(paragraph.assets, `${scope}.assets`);
  paragraph.assets.forEach((asset, index) => validateAsset(asset, `${scope}.assets[${index}]`));
}

function validateAsset(asset, scope) {
  assertObject(asset, scope);
  assertRequiredString(asset.id, `${scope}.id`);
  assertRequiredString(asset.type, `${scope}.type`);
  assertRequiredString(asset.title, `${scope}.title`);
  assertRequiredString(asset.description, `${scope}.description`);

  if (asset.type !== 'map' && asset.type !== 'image') {
    throw new Error(`${scope}.type must be "map" or "image"`);
  }

  if (asset.imageUrl !== undefined) {
    assertString(asset.imageUrl, `${scope}.imageUrl`);
  }

  if (asset.locationLabel !== undefined) {
    assertString(asset.locationLabel, `${scope}.locationLabel`);
  }

  if (asset.coordinates !== undefined) {
    assertCoordinateString(asset.coordinates, `${scope}.coordinates`);
  }

  if (asset.mapTopicId !== undefined) {
    assertString(asset.mapTopicId, `${scope}.mapTopicId`);
  }
}

function validateMapObject(mapObject, scope) {
  assertObject(mapObject, scope);
  assertRequiredString(mapObject.id, `${scope}.id`);
  assertRequiredString(mapObject.name, `${scope}.name`);
  assertRequiredString(mapObject.type, `${scope}.type`);
  assertRequiredString(mapObject.period, `${scope}.period`);
  assertCoordinateString(mapObject.coordinates, `${scope}.coordinates`);
  assertRequiredString(mapObject.detail, `${scope}.detail`);
  assertArray(mapObject.sceneIds, `${scope}.sceneIds`);
  mapObject.sceneIds.forEach((sceneId, index) =>
    assertRequiredString(sceneId, `${scope}.sceneIds[${index}]`),
  );
}

function assertObject(value, scope) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${scope} must be an object`);
  }
}

function assertArray(value, scope) {
  if (!Array.isArray(value)) {
    throw new Error(`${scope} must be an array`);
  }
}

function assertString(value, scope) {
  if (typeof value !== 'string') {
    throw new Error(`${scope} must be a string`);
  }
}

function assertRequiredString(value, scope) {
  assertString(value, scope);

  if (!value.trim()) {
    throw new Error(`${scope} is required`);
  }
}

function assertFiniteNumber(value, scope) {
  if (!Number.isFinite(Number(value))) {
    throw new Error(`${scope} must be a finite number`);
  }
}

function assertCoordinateTuple(value, scope) {
  if (!Array.isArray(value) || value.length !== 2) {
    throw new Error(`${scope} must be a two-number coordinate tuple`);
  }

  value.forEach((entry, index) => assertFiniteNumber(entry, `${scope}[${index}]`));
}

function assertCoordinateString(value, scope) {
  assertString(value, scope);
  const parts = value.split(',').map((entry) => entry.trim());

  if (parts.length !== 2 || parts.some((entry) => !entry || !Number.isFinite(Number(entry)))) {
    throw new Error(`${scope} must be a "lng, lat" string with numeric values`);
  }
}
