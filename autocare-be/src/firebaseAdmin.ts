// firebase-admin/auth pulls in jwks-rsa, which does a top-level `require('jose')` —
// jose is ESM-only, which crashes as soon as this module graph loads under Vercel's
// bundled Node runtime. A static top-level import here would eagerly load that whole
// chain at every cold start (breaking every route, not just Google sign-in), so both
// firebase-admin submodules are imported lazily, deferring the crash to only the one
// request that actually needs it.
async function loadCredential() {
  const { cert } = await import('firebase-admin/app');
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.'
    );
  }

  return cert({ projectId, clientEmail, privateKey });
}

// Initialized lazily so the rest of the API still works if Firebase env vars aren't set yet.
export async function getFirebaseAuth() {
  const { getApps, initializeApp } = await import('firebase-admin/app');
  const { getAuth } = await import('firebase-admin/auth');
  if (!getApps().length) {
    initializeApp({ credential: await loadCredential() });
  }
  return getAuth();
}
