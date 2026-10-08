export async function POST() {
  return Response.json({ success: true, message: 'Logged out' }, {
    headers: {
      'Set-Cookie': `jadai_admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`,
    },
  });
}
