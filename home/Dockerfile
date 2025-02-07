# Use an official nginx image to serve static files
FROM nginx:alpine

# Set the working directory inside the container
WORKDIR /usr/share/nginx/html

# Remove the default nginx static files
RUN rm -rf ./*

# Copy frontend files to the nginx container
COPY . .

# Expose port 80 to serve the frontend
EXPOSE 80

# Start nginx (default command is already provided by the base image)