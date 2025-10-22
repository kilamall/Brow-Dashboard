# 🖥️ Local Testing Guide - Profile Picture Feature

**Your booking app is starting locally!**

---

## 🌐 Local URLs

Once the server starts (takes ~10-30 seconds), you'll have:

**Booking App**: http://localhost:5174

---

## ✅ Quick Test Steps

### Step 1: Sign Up with Profile Picture

1. **Open**: http://localhost:5174/login
2. **Click**: "Create Account" or toggle to sign-up mode
3. **Fill in**:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "TestPass123"
4. **Upload Profile Picture**:
   - You'll see a circular profile picture uploader
   - Click "Choose Photo"
   - Select any image from your computer
   - See the preview update
5. **Submit**: Create the account

**What you'll see:**
- Circular preview of your compressed profile picture
- "Change" and "Remove" buttons
- Clean, compact UI that fits naturally in the form

---

### Step 2: Use Profile Picture in Skin Analysis

1. **Navigate to**: http://localhost:5174/skin-analysis
2. **Log in**: With the account you just created
3. **See the choice screen**:
   - **Left card**: "Use Profile Picture" (shows your uploaded photo)
   - **Right card**: "Upload New Photo" (camera icon)
4. **Click**: "Use Profile Picture"
5. **Verify**: You see your profile picture in the preview
6. **Click**: "Analyze My Skin"
7. **Watch**: The AI analyzes using your profile picture!

**What you'll see:**
- Two clear options side by side
- Thumbnail of your profile picture in the first option
- Terracotta accent colors matching your brand
- Instant preview when you select profile picture

---

### Step 3: Try Upload from Album

1. **Click**: "Choose Different Photo" (if profile pic is selected)
2. **OR Select**: "Upload New Photo" button
3. **Choose**: A different image from your computer
4. **See**: New preview appears
5. **Click**: "Analyze My Skin"
6. **Watch**: Analysis with the new upload!

**What you'll see:**
- File picker opens for selecting photos
- Preview of newly selected image
- Upload progress (if large image)
- Compressed image preview

---

### Step 4: Test Without Profile Picture

1. **Create another account** without uploading a profile picture
2. **Go to skin analysis**
3. **See**: Standard upload interface (no profile picture option)
4. **Upload**: Works exactly as before

**What you'll see:**
- No choice screen (since no profile picture exists)
- Standard upload interface
- Same skin analysis experience as before

---

## 🔍 What to Look For

### UI/UX Checks

✅ **Sign-Up Form:**
- [ ] Profile picture uploader appears between name and email
- [ ] Circular preview looks good
- [ ] "Optional" label is visible
- [ ] Can change/remove photo before submitting
- [ ] Form submits successfully with or without photo

✅ **Skin Analysis Choice:**
- [ ] Two options appear side by side (or stacked on mobile)
- [ ] Profile picture thumbnail shows correctly
- [ ] Both options have clear labels
- [ ] Hover effects work (terracotta border)
- [ ] Selection is obvious

✅ **Photo Preview:**
- [ ] Images load quickly
- [ ] Compression maintains good quality
- [ ] Preview is properly sized
- [ ] Can switch between options easily

✅ **Analysis Flow:**
- [ ] Using profile pic works instantly (no re-upload)
- [ ] Uploading new photo works as before
- [ ] Analysis completes successfully
- [ ] Results display correctly

---

## 🖼️ Test Images to Try

### Good Test Images

**For Profile Pictures:**
- Clear face photo with good lighting
- Headshot or portrait style
- File size: 1-5 MB is perfect

**For Skin Analysis:**
- Face photo without makeup (for accurate analysis)
- Natural lighting (near a window)
- Face directly facing camera
- Clear focus on facial features

### Test Different Sizes

Try images of different sizes to see compression:
- Small: <1MB (minimal compression needed)
- Medium: 2-4MB (good compression savings)
- Large: 5-8MB (significant compression, still good quality)

---

## 🔧 Development Tools

### Check Browser Console

Press `F12` or right-click → Inspect → Console tab

**Look for:**
```
✅ Image compressed: 87% reduction (3.2MB → 0.4MB)
✅ Analysis retrieved from cache - no AI costs incurred!
```

### Check Network Tab

F12 → Network tab → Filter by "Images"

**Verify:**
- Profile pictures load from Firebase Storage
- Images are properly compressed
- Load times are fast (<500ms)

### Check Firebase Console

**Firestore:**
1. Go to: https://console.firebase.google.com
2. Select your project
3. Click: Firestore Database
4. Open: `customers` collection
5. Find: Your test customer
6. Verify: `profilePictureUrl` field exists

**Storage:**
1. Go to: Firebase Console → Storage
2. Navigate to: `profile-images/{userId}/`
3. See: Your uploaded profile pictures
4. Check: File sizes (~200-500KB after compression)

---

## 🎨 Mobile Testing (Optional)

### Test on Your Phone

1. **Find your local IP**:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "
   
   # Should see something like: 192.168.1.xxx
   ```

2. **Access from phone**:
   - Connect phone to same WiFi
   - Open: http://YOUR_IP:5174
   - Test the entire flow on mobile

**What's different on mobile:**
- File picker includes camera option
- Can take photo directly
- Touch-friendly interface
- Responsive layouts

---

## 🐛 Troubleshooting

### Issue: Dev server won't start

**Solution:**
```bash
# Kill any existing process on port 5174
lsof -ti:5174 | xargs kill -9

# Restart dev server
pnpm --filter @buenobrows/booking dev
```

### Issue: Profile picture not uploading

**Check:**
1. Are you logged in when trying to upload?
2. Is the image a valid image file?
3. Is the file size under 10MB?

**Look at console:**
```javascript
// Should see:
"Image compressed: XX% reduction"
"Upload successful"
```

### Issue: Profile picture option not showing

**Verify:**
1. Did you upload a profile picture during sign-up?
2. Are you logged in with the same account?
3. Check browser console for errors

**Debug:**
Open browser console and type:
```javascript
// Should show your profile picture URL
localStorage.getItem('firebase:user')
```

### Issue: Skin analysis fails

**Check:**
1. Are Firebase functions running?
2. Is Gemini API key configured?
3. Check functions logs for errors

**Note**: Skin analysis requires proper Firebase setup and API keys. If functions aren't configured yet, you can still test the upload/selection UI!

---

## 📸 Screenshots to Take

While testing locally, grab screenshots of:

1. **Sign-up form with profile picture uploader**
2. **Profile picture preview in sign-up**
3. **Choice screen in skin analysis** (both options)
4. **Profile picture selected for analysis**
5. **Upload new photo option**
6. **Analysis results page**

These will help verify everything looks good!

---

## ⏱️ Expected Timing

- **Sign-up with photo**: ~5-10 seconds (includes compression)
- **Loading skin analysis page**: <1 second
- **Selecting profile picture**: Instant
- **Analysis with profile picture**: 15-30 seconds (AI processing)
- **Upload new photo**: ~5-10 seconds + analysis time

---

## 🎉 Success Criteria

If you can complete all these, the feature is working perfectly:

- [x] Dev server running at http://localhost:5174
- [ ] Create account with profile picture
- [ ] See profile picture in Firestore
- [ ] See file in Firebase Storage
- [ ] Open skin analysis page
- [ ] See two options (profile pic and upload)
- [ ] Select profile picture option
- [ ] Analysis works with profile picture
- [ ] Switch to upload new photo
- [ ] Upload works correctly
- [ ] No console errors

---

## 🚀 Next Steps After Local Testing

Once everything works locally:

1. **Deploy to production**:
   ```bash
   firebase deploy
   ```

2. **Test on production URLs**

3. **Share with beta users**

4. **Monitor Firebase usage**

5. **Gather feedback**

---

## 💡 Pro Tips

1. **Use incognito mode** for fresh testing (no cached data)
2. **Test with different browsers** (Chrome, Safari, Firefox)
3. **Try different image formats** (JPG, PNG, HEIC)
4. **Test edge cases** (very large images, very small images)
5. **Check mobile responsive** (resize browser window)

---

## 📞 Quick Reference

**Local URL**: http://localhost:5174

**Test Pages**:
- Sign-up: http://localhost:5174/login
- Skin Analysis: http://localhost:5174/skin-analysis

**Stop Server**: `Ctrl+C` in terminal

**Restart Server**:
```bash
pnpm --filter @buenobrows/booking dev
```

**Check Logs**: Look at terminal where dev server is running

---

**Happy Testing! 🎊**

The feature is ready to use locally. Test it out and let me know if you see anything that needs adjustment!

