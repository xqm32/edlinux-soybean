export * from './auth';
export * from './route';
export * from './system-manage';

interface IRunCode {
  language: string;
  code: string;
  cases: {
    input: string;
    output?: string;
  }[];
}

export async function runCode(data: IRunCode) {
  const resp = await fetch(import.meta.env.VITE_COMPILER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return await resp.json();
}
