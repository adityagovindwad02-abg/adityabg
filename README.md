# CINEADDICT — Luxury Wedding Films & Photography

> **Wedding Films. Honest Emotions. Timeless Stories.**  
> Cinematic Wedding Photography & Filmmaking Studio based in **Pune, Maharashtra, India**.  
> Founded by **Aditya Govindwad** (Cinematographer · Creative Director · Colorist).

---

## 🌟 Brand Overview

**CineAddict** is an independent cinema and luxury wedding brand designed for couples who value honest emotions, intentional framing, natural skin tones, and narrative pacing.

### Studio Philosophy
> *“We don't just capture weddings. We turn them into stories.”*

---

## 📁 Architecture & Pages

- **`index.html`**: Master homepage featuring the complete 16-section strategic funnel:
  1. `HERO`: Pune studio label, *YOUR WEDDING. YOUR STORY. YOUR FILM.*, dual CTAs.
  2. `TRUST NUMBERS`: 300+ Clients, 350+ Projects, 10+ Years, 4.9/5 Rating.
  3. `BRAND INTRO`: The unscripted moments narrative (*Every Wedding Has A Story*).
  4. `FEATURED WEDDING FILM`: 16:9 cinema player showcasing Ananya & Siddharth romance film.
  5. `SERVICES`: 6 core disciplines (Films, Photos, Pre-Wedding, Engagement, Drone, Social Reels).
  6. `PORTFOLIO`: Stories We've Told with category filters (`All`, `Weddings`, `Pre-Weddings`, `Reels`, `Photos`).
  7. `PHOTOGRAPHY`: *Frames That Feel Alive* editorial gallery.
  8. `CINEADDICT APPROACH`: *We Don't Direct Your Wedding. We Observe It.* (4 stages).
  9. `WEDDING COLLECTIONS`: 3 Visual Styles + 4 Curated Packages (Essential, Signature, Cinematic, Custom).
  10. `TESTIMONIALS`: Real couple quotes and reviews.
  11. `ABOUT ADITYA`: Founder profile, exact artistic statement, and verified credentials.
  12. `CREATIVE CRAFT`: Cinematography, Editing, Colour, Sound, Photography.
  13. `DESTINATION WEDDINGS`: Pune, Mumbai, Lonavala, Nashik, Kolhapur, Goa, India.
  14. `FAQ`: 7 critical client questions with smooth animated accordions.
  15. `FINAL ENQUIRY CTA`: Complete booking form with pre-filled WhatsApp link generator.
  16. `FOOTER`: Studio address, services, navigation, and social links.

### SEO-Targeted Landing Pages
- **`/wedding-photography-pune`**: Targeted for *Wedding photographer Pune, Candid wedding photography Pune*.
- **`/wedding-films-pune`**: Targeted for *Cinematic wedding films Pune, Wedding videographer Pune*.
- **`/pre-wedding-films-pune`**: Targeted for *Pre-wedding photographer Pune, Lonavala shoots*.
- **`/engagement-photography-pune`**: Targeted for *Ring ceremony and engagement photography Pune*.
- **`/destination-wedding-films`**: Targeted for *Destination wedding cinematographer India, Goa/Rajasthan*.
- **`vercel.json`**: Configures clean URLs without `.html` extensions.

---

## 🛠️ How to Edit Projects, Packages & Testimonials

### 1. Adding or Editing a Portfolio Video:
Open `index.html` and locate the `<div class="portfolio-grid">` section:
```html
<article class="project-card work-item" data-category="wedding">
  <div class="project-media-wrap video-aspect-16-9" data-src="YOUR_VIDEO.mp4" data-title="Couple Name — Wedding Film" data-type="video">
    <video class="card-video-element" poster="media/YOUR_POSTER.png" preload="none" muted loop playsinline>
      <source src="YOUR_VIDEO.mp4" type="video/mp4">
    </video>
    ...
  </div>
  <div class="project-details">
    <h3 class="project-title">Couple Name — Wedding Film</h3>
    <p class="project-desc">Description of the celebration...</p>
  </div>
</article>
```

### 2. Updating Packages & Collections:
Locate `<section id="collections">` in `index.html`. You can customize deliverables or notes under each `<div class="package-card">`.

### 3. Updating WhatsApp Number:
In `main.js`, update the constant at the top:
```javascript
const CINEADDICT_WHATSAPP = '917385229599'; // Replace with your 10-digit WhatsApp number (with country code)
```
And search & replace `917385229599` in `index.html` with your actual WhatsApp business number.

---

## 🚀 Local Development

To preview the website locally:
```bash
python3 -m http.server 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---
*© 2026 CineAddict Studios. Founded by Aditya Govindwad. Pune, Maharashtra, India.*
