import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

// 実行例: node --env-file=.env scripts/generate-openrouter-images.mjs jobs.json output-dir
const [jobsPath, outputDir] = process.argv.slice(2);
if (!jobsPath || !outputDir || !process.env.OPENROUTER_API_KEY) {
  throw new Error('jobs.json、出力先、OPENROUTER_API_KEY が必要です');
}
const jobs = JSON.parse(await readFile(jobsPath, 'utf8'));
await mkdir(outputDir, { recursive: true });
for (const job of jobs) {
  if (!/^[a-z0-9-]+$/.test(job.id)) throw new Error('不正な画像ID');
  const target = path.join(outputDir, `${job.id}.png`);
  const exists = await access(target).then(
    () => true,
    () => false
  );
  if (exists) {
    console.log(`${job.id}: 保存済みのためスキップ`);
    continue;
  }
  const request = {
    model: job.model || 'openai/gpt-image-2',
    prompt: job.prompt,
    aspect_ratio: job.aspect_ratio || '3:2',
    quality: job.quality || 'high',
    n: 1,
  };
  const response = await fetch('https://openrouter.ai/api/v1/images', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(300000),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(`OpenRouter ${response.status}: ${result.error?.message || '生成失敗'}`);
  const image = result.data?.[0];
  if (!image?.b64_json || (image.media_type && image.media_type !== 'image/png'))
    throw new Error('PNG画像が返されませんでした');
  await writeFile(target, Buffer.from(image.b64_json, 'base64'));
  await writeFile(
    path.join(outputDir, `${job.id}.json`),
    JSON.stringify(
      { id: job.id, ...request, usage: result.usage, createdAt: new Date().toISOString() },
      null,
      2
    )
  );
  console.log(JSON.stringify({ id: job.id, path: target, usage: result.usage }));
}
