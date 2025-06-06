// export async function verifyRecaptcha(token: string, ip?: string) {
//   const secretKey = process.env.RECAPTCHA_SECRET_KEY!;
//   const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//     body: `secret=${secretKey}&response=${token}${ip ? `&remoteip=${ip}` : ''}`,
//   });

//   const data = await response.json();
//   return data.success && data.score >= 0.5; // You can adjust score threshold
// }
