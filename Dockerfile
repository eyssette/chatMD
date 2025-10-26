# Use a lightweight Nginx image as the base image
FROM nginx:alpine

# Copy the application files to the Nginx HTML directory
COPY app /usr/share/nginx/html

# Expose the port the app runs on
EXPOSE 80

# Default command to run Nginx
CMD ["nginx", "-g", "daemon off;"]