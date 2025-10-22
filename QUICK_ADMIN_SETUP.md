# ⚡ Quick Admin Setup

## 🎯 Create Admin Account (Secure Method)

### One Command:
```bash
node create-admin-secure.js user@example.com
```

**That's it!** ✨

---

## 📋 Prerequisites (One-time setup)

```bash
# 1. Login to Firebase CLI
firebase login

# 2. Select your project  
firebase use default

# 3. Make sure the user exists
# (They must have logged in to your app at least once)
```

---

## ✅ Before Deployment Checklist

```bash
# Run cleanup check
node cleanup-before-deploy.js

# If all green, you're good to deploy!
```

---

## 🔒 What We Protected

✅ No service account keys required  
✅ No hardcoded credentials  
✅ No secrets in git history  
✅ Updated .gitignore for security  
✅ Safe cleanup before deployment  

---

## 📚 Need More Info?

See `ADMIN_SECURITY_GUIDE.md` for complete documentation.

---

## 🚨 Emergency: Exposed Secrets?

1. **Stop** - Don't push/deploy
2. **Revoke** - Immediately revoke the credentials  
3. **Clean** - Remove from git history
4. **Rotate** - Generate new credentials
5. See `ADMIN_SECURITY_GUIDE.md` for detailed steps

---

**Remember:** The secure script (`create-admin-secure.js`) is production-ready and safe to commit to git! 🎉

