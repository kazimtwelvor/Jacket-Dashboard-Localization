const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'a7b9c2d4e6f8g1h3j5k7m9n2p4q6r8s0';

export function encrypt(text: string): string {
  const iv = Math.random().toString(16).substr(2, 16);
  let encrypted = '';
  
  for (let i = 0; i < text.length; i++) {
    const textChar = text.charCodeAt(i);
    const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
    const encryptedChar = textChar ^ keyChar;
    encrypted += encryptedChar.toString(16).padStart(2, '0');
  }
  
  return iv + ':' + encrypted;
}