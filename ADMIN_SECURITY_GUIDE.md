# 🔒 Secure Admin Creation Guide

## ⚠️ IMPORTANT: Security First

This guide explains how to create admin accounts securely **without exposing any credentials** in your codebase.

---

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Make sure you're logged in to Firebase CLI
firebase login

# Select your project
firebase use default
```

### 2. Create Admin Account (Secure Method)

```bash
# The user must already exist in Firebase Auth
# (they need to have logged in at least once)

node create-admin-secure.js user@example.com
```

**That's it!** No service account keys, no exposed secrets, no security risks.

---

## 🛡️ Security Features

✅ **No Hardcoded Credentials** - Uses Firebase CLI authentication  
✅ **No Service Account Keys** - Uses Application Default Credentials  
✅ **Safe for Git** - Script can be safely committed to repository  
✅ **Audit Trail** - Timestamps admin creation in custom claims  
✅ **Interactive Confirmation** - Prevents accidental admin creation  

---

## 📋 Complete Workflow

### Step 1: User Signs Up
User must create account first through your app:
- Go to your booking app
- Sign up with email/password or phone
- Verify email (if using email auth)

### Step 2: Make User Admin
```bash
node create-admin-secure.js their@email.com
```

### Step 3: User Re-authenticates
User must sign out and sign back in for admin privileges to take effect.

### Step 4: Verify Admin Access
- User logs into admin dashboard
- Should now see admin features
- Check that permissions work correctly

---

## 🧹 Cleanup Checklist

Before deploying, run this cleanup to ensure no secrets are exposed:

### Automated Cleanup Script

```bash
node cleanup-before-deploy.js
```

### Manual Cleanup Checklist

- [ ] Remove all service account key files (*.json)
- [ ] Remove temporary user export files
- [ ] Check no secrets in environment variables are hardcoded
- [ ] Verify .gitignore includes all sensitive patterns
- [ ] Check git history for accidentally committed secrets
- [ ] Remove old admin creation scripts with hardcoded values

---

## 🔍 Security Audit Commands

### Check for Sensitive Files
```bash
# Check working directory
find . -name "service-account*.json" -o -name "*-key.json" -o -name "*.pem" | grep -v node_modules

# Check git history
git log --all --full-history --pretty=format:"%H" -- "*service-account*.json" "*-key.json" "*.pem"
```

### If Secrets Were Committed to Git

**⚠️ CRITICAL**: If service account keys or secrets were ever committed:

```bash
# Option 1: Remove from recent history (if recent)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch service-account-key.json" \
  --prune-empty --tag-name-filter cat -- --all

# Option 2: Use BFG Repo-Cleaner (recommended for large repos)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files service-account*.json

# After cleaning
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (coordinate with team first!)
git push origin --force --all
```

**Then IMMEDIATELY**:
1. Revoke the exposed service account key in Google Cloud Console
2. Generate a new service account key (store securely, NOT in git)
3. Update your deployment secrets/environment variables

---

## 🎯 Best Practices

### DO ✅
- Use `create-admin-secure.js` for all admin creation
- Keep service account keys in secure secret managers
- Use environment variables for sensitive configuration
- Regularly audit your `.gitignore` file
- Use Firebase CLI authentication for scripts
- Review git history before public deployment

### DON'T ❌
- Hardcode emails in scripts that go to git
- Commit service account keys to repository
- Use service accounts when Firebase CLI auth works
- Share service account keys via email/chat
- Leave temporary credential files in the project
- Deploy without running security checks

---

## 🔑 Managing Service Accounts (If Needed)

If you absolutely need service accounts for CI/CD:

### Secure Storage Options
1. **GitHub Secrets** (for GitHub Actions)
2. **Environment Variables** (on deployment platform)
3. **Google Secret Manager** (recommended)
4. **HashiCorp Vault**
5. **AWS Secrets Manager**

### Never:
- ❌ Commit to git
- ❌ Store in plaintext files
- ❌ Send via email or chat
- ❌ Share in documentation

---

## 🆘 Emergency Response

### If You Committed Secrets:

**Immediate Actions (within 5 minutes):**
1. Stop! Don't push if you haven't already
2. If pushed, assume the secret is compromised
3. Immediately revoke/rotate the credentials
4. Use git history rewriting to remove the secret
5. Force push the cleaned history
6. Generate new credentials
7. Update all systems with new credentials

**Follow-up Actions:**
1. Audit access logs for unauthorized usage
2. Review security policies with team
3. Set up pre-commit hooks to prevent future incidents
4. Consider using tools like git-secrets or TruffleHog

---

## 📚 Additional Resources

- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/best-practices)
- [Google Cloud Service Account Best Practices](https://cloud.google.com/iam/docs/best-practices-service-accounts)
- [Git Secret Scanning](https://github.com/awslabs/git-secrets)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

---

## ✅ Pre-Deployment Checklist

Run through this before every deployment:

```bash
# 1. Check for sensitive files
find . -name "*.json" -path "*/service-account*" -o -name "*-key.json"

# 2. Verify .gitignore is comprehensive
cat .gitignore | grep -E "(service-account|\.pem|credentials)"

# 3. Check git status
git status --porcelain

# 4. Run automated cleanup
node cleanup-before-deploy.js

# 5. Verify no secrets in code
git grep -i "service.?account" | grep -v node_modules | grep -v ".md"
```

All clear? Safe to deploy! 🚀

---

## 💬 Questions or Issues?

If you need help:
1. Check this guide first
2. Review Firebase documentation
3. Check your security logs
4. Consider a security audit

**Remember: Security is not optional. Take the time to do it right.**

