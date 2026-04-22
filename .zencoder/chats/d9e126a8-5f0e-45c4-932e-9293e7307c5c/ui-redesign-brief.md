# GI-KACE portal redesign brief

## Objective
Redesign the existing GI-KACE students registration portal so the entire portal feels inspired by the provided reference image while still fitting the GI-KACE brand and use case. The final result should feel like one coherent product across the public landing page, registration flow, admin login, and admin dashboard.

## Target audience
- Prospective students visiting the public portal
- Applicants filling out the registration form
- GI-KACE admins managing student records

## Scope
Redesign these existing application pages and shared UI elements inside the current React + Tailwind application:
- `client/src/components/Navbar.jsx`
- `client/src/components/Footer.jsx`
- `client/src/components/Modal.jsx`
- `client/src/pages/Home.jsx`
- `client/src/pages/Register.jsx`
- `client/src/pages/AdminLogin.jsx`
- `client/src/pages/AdminDashboard.jsx`
- `client/src/index.css`

Output path: `c:\Users\franc\Students-Registration-Portal\client\src`

## Aesthetic direction
Use the reference screenshot as inspiration, not as a literal copy.

Key visual cues to carry over:
- Soft lavender / violet / indigo atmosphere
- Large rounded cards with layered depth
- Clean white content surfaces floating over a tinted background
- Dashboard-like composition for authenticated pages
- Soft shadows, pill inputs, and gradient hero panels
- Friendly, modern, student-focused tone

## Page-specific direction
### Public home page
Keep it as a public landing page, not a private dashboard. However, restyle it to feel related to the reference:
- Introduce a strong hero card composition inspired by the screenshot's main banner
- Keep sections for GI-KACE information and courses
- Use premium card layouts, rounded panels, and subtle purple gradients
- Make the page feel more editorial and polished than the current basic landing page

### Registration page
Transform the form into a premium multi-panel experience:
- Keep the existing form fields and validation behavior
- Use a polished layout with grouped sections inside elevated cards
- Add a dashboard-inspired side summary / header / progress feel if it helps, but keep usability strong
- Preserve mobile friendliness and readability for long-form data entry

### Admin login page
Restyle as a compact premium panel that clearly belongs to the same product family:
- Rich gradient background treatment
- Strong card container with rounded corners and depth
- Elevated, modern form styling

### Admin dashboard
This is the closest match to the reference image:
- Use a left sidebar layout on desktop
- Add a top strip with search and admin identity area
- Add a bold gradient welcome/overview panel
- Use metric cards, rounded table containers, and supporting side panels or summary sections where useful
- Preserve current functionality: search, pagination, view/edit/delete, logout
- Keep the page responsive and collapse gracefully for tablet/mobile

## Typography direction
- Use the existing stack unless introducing a web font is already supported by the current app setup without external dependency complexity
- Favor bold, friendly headings and softer body text
- High contrast for primary data, muted text for secondary info

## Color direction
Primary palette direction:
- Violet / lavender / indigo gradient family
- White and off-white surfaces
- Soft lilac backgrounds
- Deep navy or charcoal text for readability
- Accent states can use stronger purple, blue-violet, or magenta highlights

Avoid:
- Flat generic blue-only styling
- Harsh black-on-white enterprise look
- Overly dark UI

## Layout / interaction principles
- Maintain all existing routes and behaviors
- Do not remove existing form fields or admin actions
- Improve hierarchy, spacing, and perceived polish
- Prefer reusable visual patterns across pages
- Keep forms and tables practical first, decorative second
- Ensure mobile layouts remain usable

## What makes it memorable
The portal should feel like a modern student command center: soft violet atmosphere, oversized rounded surfaces, a standout welcome banner, and a consistent premium product feel from landing page through admin workflows.

## Image needs
No external image URLs. Prefer CSS gradients, abstract shapes, and decorative surfaces first.
If imagery is useful, create only minimal local visual assets that support the design language. Raster images are preferred over SVG for decorative illustration, but only if actually necessary.

## Technical constraints
- Work inside the existing React + Tailwind app
- Follow existing routing and state flows
- Keep all current functionality intact
- Do not introduce comments unless required by existing code patterns
- Do not alter backend behavior for this redesign unless absolutely necessary for presentation

## Reference
Reference screenshot path:
`c:\Users\franc\OneDrive\Pictures\Screenshots 1\Screenshot (14).png`
