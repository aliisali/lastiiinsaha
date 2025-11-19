# AR Camera Implementation Guide

## Overview

The AR Camera functionality has been successfully implemented and is now available throughout the BlindsCloud platform. The AR camera allows users to upload images, place them as overlays on live camera feeds, and capture screenshots for product visualization and measurements.

## Implementation Details

### 1. Standalone AR Camera Page

**File:** `ar-camera.html`
- A dedicated HTML page for standalone AR camera access
- Opens in a new browser tab for full-screen camera experience
- Optimized for mobile devices with touch controls
- Includes proper meta tags for camera permissions and mobile optimization

**Entry Point:** `src/ar-camera-entry.tsx`
- React entry point for the standalone AR camera
- Uses ARCameraModule component
- Independent from the main application bundle

### 2. AR Camera Components

**ARCameraModule** (`src/components/ARModule/ARCameraModule.tsx`)
- Full-featured AR camera with file upload
- Drag-and-drop AR overlay positioning
- Real-time camera feed rendering
- Screenshot capture and storage
- Adjustable scale, rotation, position controls
- Grid overlay for alignment
- Saved screenshots gallery

**ARCameraV2** (`src/components/ARModule/ARCameraV2.tsx`)
- Advanced version with enhanced controls
- Opacity and flip controls
- Drag-to-position overlay
- Better mobile optimization
- Fit-to-width functionality

**ARCameraCapture** (`src/components/ARModule/ARCameraCapture.tsx`)
- Lightweight component for quick photo capture
- Used within job workflows (measurements, product selection)
- Front/back camera toggle
- Retake and confirm functionality
- Product overlay support

### 3. Access Points

#### Sidebar Navigation
- **Admin Users:** AR Camera and AR Camera V2 menu items
- **Business Users:** AR Camera menu item (with permission check)
- Clicking opens AR camera in a new tab
- Pop-up blocker warning if needed

#### Job Workflows
- **Measurement Screen:** Photo capture button
- **Product Selection:** AR visualization for product previews
- Opens ARCameraCapture modal within the workflow

### 4. Permissions System

**Permission Checks:**
```typescript
// Sidebar.tsx - hasARCameraPermission()
- Admin: Always has access
- Business/Employee: Checks module_permissions table
- Fallback: Checks legacy permission strings
```

**Module Permission:** `ar-camera`
- Stored in `module_permissions` table in Supabase
- Can be granted by admins through Module Permissions page

### 5. Mobile Optimization

**Camera Constraints:**
- Desktop: 1280x720 resolution
- Mobile: 1920x1080 resolution (higher quality)
- Prefers rear camera (`facingMode: 'environment'`)
- Falls back to front camera if rear not available

**Mobile Features:**
- Touch-friendly controls
- Pinch-to-zoom support (in ARCameraV2)
- Full-screen experience
- Proper viewport settings for mobile browsers

### 6. Error Handling

**Common Errors:**
- **NotAllowedError:** Camera permission denied
- **NotFoundError:** No camera detected
- **NotReadableError:** Camera in use by another app
- **AbortError:** Camera access interrupted

**User Feedback:**
- Clear error messages with troubleshooting steps
- Visual indicators for camera status
- Loading states during initialization
- Permission request instructions

## Usage Instructions

### For Admins

1. **Access AR Camera:**
   - Click "AR Camera" or "AR Camera V2" in sidebar
   - New tab opens with standalone AR camera
   - Grant camera permissions when prompted

2. **Upload Files:**
   - Click "Upload Files" button
   - Select product images or measurements
   - Images stored in browser local storage

3. **Start AR View:**
   - Select an uploaded file
   - Click "START AR CAMERA"
   - Position overlay using on-screen controls
   - Capture screenshot to save

4. **Manage Permissions:**
   - Go to "Module Permissions" in sidebar
   - Grant "ar-camera" access to business users
   - Permissions sync with Supabase

### For Business Users

1. **Check Access:**
   - Look for "AR Camera" in sidebar
   - If not visible, request permission from admin

2. **In Job Workflows:**
   - Measurement screen has camera button
   - Product selection has AR preview
   - Captures save directly to job

### For Employees

1. **Job Camera Access:**
   - Available in assigned job workflows
   - Measurement photos
   - Product visualization
   - Installation photos

## Technical Requirements

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14.5+
- Mobile browsers with camera API support

### Security Requirements
- **HTTPS Required:** Camera access only works over HTTPS or localhost
- **Permissions:** User must grant camera permissions
- **CSP:** Content Security Policy configured for camera access

### Performance Considerations
- Canvas rendering at 60 FPS
- Optimized bundle splitting (ar-modules chunk)
- Lazy loading of AR components
- Efficient stream cleanup on unmount

## Build Configuration

**Vite Config Updates:**
```typescript
rollupOptions: {
  input: {
    main: resolve(__dirname, 'index.html'),
    'ar-camera': resolve(__dirname, 'ar-camera.html'),
  }
}
```

**Build Output:**
- `dist/index.html` - Main application
- `dist/ar-camera.html` - Standalone AR camera
- `dist/assets/ar-modules-*.js` - AR camera bundle

## Testing Checklist

- [ ] AR camera opens in new tab from sidebar
- [ ] Camera permissions request works
- [ ] File upload and selection works
- [ ] AR overlay renders correctly
- [ ] Screenshot capture and download works
- [ ] Mobile camera access (front/back toggle)
- [ ] Error messages display properly
- [ ] Permission system works for all roles
- [ ] Camera cleanup on page close
- [ ] Works on HTTPS deployment

## Deployment Notes

1. **Ensure HTTPS:** Camera API requires secure connection
2. **Set Permissions:** Configure camera permissions in Supabase
3. **Test Mobile:** Verify on actual mobile devices
4. **Pop-up Blockers:** Users may need to allow pop-ups for new tab
5. **CSP Headers:** Ensure Content-Security-Policy allows camera access

## Future Enhancements

- AR object tracking
- 3D model overlay support
- Multi-image capture sessions
- Cloud storage integration
- Real-time collaboration
- Advanced image filters
- Measurement tools overlay
- QR code scanning for product info

## Troubleshooting

**Camera Not Starting:**
1. Check HTTPS connection
2. Verify browser permissions
3. Close other apps using camera
4. Try different browser
5. Check console for errors

**New Tab Not Opening:**
1. Allow pop-ups in browser
2. Check browser security settings
3. Try Ctrl+Click to force new tab

**Permission Denied:**
1. Click camera icon in address bar
2. Select "Allow" for camera
3. Refresh page
4. Check browser settings

## Support

For issues or questions:
- Check browser console for error logs
- Verify camera permissions in browser settings
- Ensure HTTPS is enabled
- Contact system administrator for permission issues
