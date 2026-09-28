export const TWG_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 130" width="100%" height="100%">
  <defs>
    <linearGradient id="twgBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#225319"/>
      <stop offset="45%" stop-color="#337425"/>
      <stop offset="100%" stop-color="#24571A"/>
    </linearGradient>
    <radialGradient id="twgHighlight" cx="70%" cy="10%" r="80%">
      <stop offset="0%" stop-color="#469333" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#24571A" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-5%" y="-5%" width="115%" height="115%">
      <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="320" height="130" rx="8" fill="url(#twgBg)"/>
  <rect width="320" height="130" rx="8" fill="url(#twgHighlight)"/>

  <!-- Subtle curved backdrop glow in top right -->
  <path d="M 180 0 Q 210 60 320 70 L 320 0 Z" fill="rgba(255,255,255,0.06)" />

  <!-- Koru / Fern Frond Cluster on Right -->
  <g fill="#FFFFFF" transform="translate(185, 10)">
    <!-- Top-most koru -->
    <g transform="translate(32, 18) scale(0.65)">
      <path d="M0,0 C8,-6 16,-2 18,6 C20,14 14,22 6,22 C-2,22 -8,15 -8,7 C-8,-1 -2,-7 6,-7 C12,-7 16,-3 16,3 C16,7 13,10 9,10 C6,10 4,8 4,5 C4,3 5,2 7,2 C7,3 6,4 5,4 C4.5,4 4.5,3.5 5,3 C5.5,2.5 6.5,2.5 7,3 C8,4 7,6 5,6 C3,6 1,4 1,1 C1,-3 4,-5 8,-5 C12,-5 14,-2 14,3 C14,8 10,13 4,13 C-2,13 -6,8 -6,2 C-6,-5 -1,-10 7,-10 C15,-10 20,-3 18,6 C16,14 9,20 1,19 C-6,18 -11,12 -10,4 C-9,-5 -1,-12 9,-12 C18,-12 24,-4 22,6 C20,16 11,24 0,24 C-10,24 -17,16 -15,5 C-14,-6 -4,-15 8,-15 C19,-15 27,-5 25,7" />
    </g>

    <!-- Upper Koru Cluster -->
    <g transform="translate(42, 38) scale(0.9)">
      <path d="M0,0 C6,-5 13,-2 14,4 C16,11 11,17 5,17 C-1,17 -6,12 -6,5 C-6,-1 -1,-6 5,-6 C10,-6 13,-3 13,2 C13,5 10,7 7,7 C5,7 3,5 3,3 C3,1.5 4,1 5,1 C5,2 4,3 3,3 C3,1.5 4,1 5,1 C6,1 7,2.5 6,4 C5,6 3,6 2,4 C1,2 2,0 4,-1 C6,-2 9,-1 9,2 C9,5 7,8 4,8 C1,8 -2,5 -2,1 C-2,-3 1,-7 6,-7 C11,-7 15,-2 14,4 C13,10 8,15 2,14 C-4,13 -7,8 -7,2 C-7,-4 -2,-9 5,-9 C12,-9 17,-3 16,4 C15,12 8,18 0,18" />
    </g>

    <g transform="translate(56, 45) scale(0.55)">
      <path d="M0,0 C6,-5 13,-2 14,4 C16,11 11,17 5,17 C-1,17 -6,12 -6,5 C-6,-1 -1,-6 5,-6 C10,-6 13,-3 13,2 C13,5 10,7 7,7 C5,7 3,5 3,3 C3,1.5 4,1 5,1" />
    </g>

    <g transform="translate(34, 52) scale(0.7)">
      <path d="M0,0 C6,-5 13,-2 14,4 C16,11 11,17 5,17 C-1,17 -6,12 -6,5 C-6,-1 -1,-6 5,-6 C10,-6 13,-3 13,2 C13,5 10,7 7,7 C5,7 3,5 3,3" />
    </g>

    <!-- Middle Koru Cluster -->
    <g transform="translate(24, 70) scale(0.85)">
      <path d="M0,0 C6,-5 13,-2 14,4 C16,11 11,17 5,17 C-1,17 -6,12 -6,5 C-6,-1 -1,-6 5,-6 C10,-6 13,-3 13,2 C13,5 10,7 7,7 C5,7 3,5 3,3 C3,1.5 4,1 5,1 C6,1 7,2.5 6,4 C5,6 3,6 2,4 C1,2 2,0 4,-1 C6,-2 9,-1 9,2 C9,5 7,8 4,8 C1,8 -2,5 -2,1 C-2,-3 1,-7 6,-7 C11,-7 15,-2 14,4 C13,10 8,15 2,14" />
    </g>

    <g transform="translate(38, 76) scale(0.6)">
      <path d="M0,0 C6,-5 13,-2 14,4 C16,11 11,17 5,17 C-1,17 -6,12 -6,5 C-6,-1 -1,-6 5,-6 C10,-6 13,-3 13,2 C13,5 10,7 7,7" />
    </g>

    <!-- Bottom-most Koru Cluster -->
    <g transform="translate(8, 92) scale(1.1)">
      <path d="M0,0 C6,-5 13,-2 14,4 C16,11 11,17 5,17 C-1,17 -6,12 -6,5 C-6,-1 -1,-6 5,-6 C10,-6 13,-3 13,2 C13,5 10,7 7,7 C5,7 3,5 3,3 C3,1.5 4,1 5,1 C6,1 7,2.5 6,4 C5,6 3,6 2,4 C1,2 2,0 4,-1 C6,-2 9,-1 9,2 C9,5 7,8 4,8 C1,8 -2,5 -2,1 C-2,-3 1,-7 6,-7 C11,-7 15,-2 14,4 C13,10 8,15 2,14 C-4,13 -7,8 -7,2 C-7,-4 -2,-9 5,-9 C12,-9 17,-3 16,4 C15,12 8,18 0,18" />
    </g>

    <g transform="translate(19, 102) scale(0.65)">
      <path d="M0,0 C6,-5 13,-2 14,4 C16,11 11,17 5,17 C-1,17 -6,12 -6,5 C-6,-1 -1,-6 5,-6 C10,-6 13,-3 13,2 C13,5 10,7 7,7" />
    </g>
  </g>

  <!-- The Warehouse Group Typography -->
  <g fill="#FFFFFF" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <text x="195" y="52" text-anchor="end" font-size="20" font-weight="900" letter-spacing="1">THE</text>
    <text x="195" y="78" text-anchor="end" font-size="25" font-weight="900" letter-spacing="-0.3">WAREHOUSE</text>
    <text x="195" y="103" text-anchor="end" font-size="25" font-weight="900" letter-spacing="0.5">GROUP</text>
  </g>
</svg>`;

export const TWG_LOGO_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(TWG_LOGO_SVG)}`;
export const TWG_LOGO_BASE64 = TWG_LOGO_DATA_URL;
