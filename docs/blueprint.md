# **App Name**: Flizo Copilot Login

## Core Features:

- Logo Display: Display the app logo (Flizo Copilot).
- Credential Inputs: Provide input fields for email and password.
- Additional Options: Offer a 'Remember Me' checkbox and a 'Forgot Password' link.
- Login Button: Include a 'Login' button with disabled state until both fields are valid.
- API Authentication: Implement API call to GPS-WOX `/api/auth/login` endpoint to authenticate user.
- Token Storage: Store authentication token in AsyncStorage (React Native) or localStorage (web).
- Error Handling: Handle and display error messages for invalid credentials or network errors.

## Style Guidelines:

- Primary color: Saturated blue (#29ABE2) to convey trust and reliability, central to vehicle tracking applications.
- Background color: Light gray (#F0F2F5) for a clean and modern look.
- Accent color: Vibrant green (#90EE90) to highlight interactive elements such as the login button and password reset.
- Font: 'Inter' sans-serif, for both headings and body text, to maintain clarity and modernity. 
- Mobile-first design with ample spacing and rounded buttons.
- Simple, modern icons for inputs and options, ensuring clarity and ease of use.
- Subtle transitions for input focus and button presses to enhance user engagement.