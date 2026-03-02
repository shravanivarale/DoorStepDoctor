# Fix Three.js Dependency Warning

## Issue
```
ERROR in ./node_modules/three-mesh-bvh/src/utils/ExtensionUtilities.js
export 'BatchedMesh' (imported as 'THREE') was not found in 'three'
```

## Root Cause
- Your Three.js version (0.158.0) is too old for `@react-three/drei` v9.92.7
- `BatchedMesh` was added in Three.js v0.159.0+
- This is a transitive dependency issue (drei → three-mesh-bvh → three)

## Solution Applied
✅ Updated `package.json`:
- Changed `three` from `^0.158.0` to `^0.160.0`
- Added `resolutions` field to force all packages to use Three.js v0.160.0

## How to Fix

### Step 1: Update Dependencies
```bash
npm install
```

This will install Three.js v0.160.0 which includes `BatchedMesh`.

### Step 2: Clear Cache and Restart
```bash
# Stop the dev server (Ctrl+C)
rm -rf node_modules/.cache
npm start
```

### Step 3: Verify
You should see:
```
Compiled successfully!
```

No more errors about `BatchedMesh`.

---

## Alternative: If npm install doesn't work

If you're still seeing the error after `npm install`, try this:

```bash
# Stop the dev server
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall everything
npm install

# Clear cache
rm -rf node_modules/.cache

# Start again
npm start
```

---

## Why This Happened

The `@react-three/drei` package depends on `three-mesh-bvh`, which in turn expects newer Three.js features like `BatchedMesh`. Your original Three.js version (0.158.0) didn't have this feature.

**Timeline:**
- Three.js v0.158.0 (Nov 2023) - Your original version
- Three.js v0.159.0 (Dec 2023) - Added `BatchedMesh`
- Three.js v0.160.0 (Jan 2024) - Stable with `BatchedMesh`

---

## Impact on Your App

**Good news:** This warning doesn't break your app! The frontend still works because:
- You're not using `three-mesh-bvh` directly
- You're not using `BatchedMesh` in your code
- The 3D dashboard uses basic Three.js features that work fine

**However:** It's better to fix it to:
- Remove the warning message
- Ensure compatibility with all dependencies
- Prevent potential issues in the future

---

## After Fixing

Once you run `npm install` and restart, you should see:

```
Compiled successfully!

You can now view doorstep-doctor-demo in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
To create a production build, use npm run build.

webpack compiled successfully
```

---

## Status

- [x] Updated package.json with Three.js v0.160.0
- [ ] Run `npm install` to update dependencies
- [ ] Restart dev server with `npm start`
- [ ] Verify "Compiled successfully!" message

---

**Next Command:** `npm install`

**Last Updated:** March 2, 2026
