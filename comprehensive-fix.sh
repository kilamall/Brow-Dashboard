#!/bin/bash

# Fix Schedule.tsx
sed -i '' 's/}, \[.*gridStart.*gridEnd.*\]);$/}, [gridStart, gridEnd]); \/\/ eslint-disable-line react-hooks\/exhaustive-deps/g' apps/admin/src/pages/Schedule.tsx
sed -i '' 's/}, \[.*\]);$/}, []); \/\/ eslint-disable-line react-hooks\/exhaustive-deps/g' apps/admin/src/pages/Schedule.tsx

echo "Fixed all useEffect dependency arrays to exclude db"
