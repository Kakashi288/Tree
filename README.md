# Family Tree Visualization

A beautiful, interactive family tree visualization that displays generations in a tree trunk and concentric semicircles.

## Features

- **Tree Trunk Display**: Generations 1-10 are shown vertically inside a realistic brown tree trunk with roots
- **Concentric Semicircles**: Generations 11+ branch out into expanding semicircular arcs
- **Interactive Zoom**: Mouse wheel zoom and control buttons for navigation
- **Smart Layout**: Children are positioned near their parents for clear lineage tracking
- **Responsive Design**: Adapts to different screen sizes

## File Structure

```
Tree3/
├── index.html      # Main HTML structure
├── styles.css      # All styling and layout
├── script.js       # Family tree logic and rendering
└── README.md       # This file
```

## Deployment

### Local Testing
Simply open `index.html` in a modern web browser.

### Web Hosting
Upload all three files (`index.html`, `styles.css`, `script.js`) to your web server:

1. **Static Hosting** (GitHub Pages, Netlify, Vercel)
   - Push files to repository
   - Enable static hosting
   - Access via provided URL

2. **Traditional Web Server** (Apache, Nginx)
   - Upload files to web root directory
   - Ensure proper file permissions
   - Access via server domain

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Requires SVG and ES6 support

## Usage

- **Zoom In/Out**: Use mouse wheel or control buttons
- **Reset View**: Click "Reset View" button to return to default zoom
- **Add Family Members**: Edit the `familyData` array in `script.js`

## Adding New Family Members

All family tree modifications are made in the **`script.js`** file only.

### Step 1: Adding a New Node

To add a new family member, add an entry to the `familyData` array at the beginning of `script.js`:

```javascript
{ name: "NEW_NAME", generation: 23, parents: [1, 2, 1, 2, 1, 2, 3, 4, 1, 1, 1, 1, 1] }
```

**Understanding the parents array:**
- The `parents` array is the path from the root ancestor to this person
- Each number represents which child (1 = first child, 2 = second child, etc.)
- Example: `[1, 2, 1, 2, 1]` means: 1st child → 2nd child → 1st child → 2nd child → 1st child

**Example - Adding a new person to Generation 23:**

Let's say you want to add "BHUSHAN" as the second child of "YASH" (who has parents `[1, 1, 1, 1, 4, 1, 3, 3, 1, 1, 4, 1, 2, 1]`):

```javascript
// Find YASH in the familyData array (around line 524)
{ name: "YASH", generation: 23, parents: [1, 1, 1, 1, 4, 1, 3, 3, 1, 1, 4, 1, 2, 1] },

// Add the new entry right after (or anywhere in the array)
{ name: "BHUSHAN", generation: 24, parents: [1, 1, 1, 1, 4, 1, 3, 3, 1, 1, 4, 1, 2, 1, 2] },
//                                                                                        ^ adds a 2 for "second child"
```

### Step 2: Adjusting Spread Angle (Spacing Between Siblings)

If the new node and its siblings are too close or too far apart, adjust the spread angle in the positioning code (around line 3400 in `script.js`).

**Location in script.js:** Search for the section that starts with `let spreadAngle;`

**Example - Tightening spacing for YASH's children:**

```javascript
// Find the spreadAngle section (around line 3400)
} else if (JSON.stringify(person.parents.slice(0, 13)) === JSON.stringify([1, 1, 1, 1, 4, 1, 3, 3, 1, 1, 4, 1, 2])) {
    spreadAngle = minSpread * 0.8; // YASH's children - reduce from 1.0 to 0.8 for tighter spacing
```

**Spread angle multipliers:**
- `minSpread * 0.7` = Very tight spacing
- `minSpread * 1.0` = Normal spacing
- `minSpread * 1.5` = Wide spacing
- `minSpread * 2.0` = Very wide spacing

**Adding a new spread angle rule:**

```javascript
// Add this in the spreadAngle section (around line 3430)
} else if (JSON.stringify(person.parents.slice(0, 14)) === JSON.stringify([1, 1, 1, 1, 4, 1, 3, 3, 1, 1, 4, 1, 2, 1])) {
    spreadAngle = minSpread * 0.9; // Custom spacing for YASH's children
```

### Step 3: Moving Nodes Left or Right (Horizontal Positioning)

If a node needs to move left (anticlockwise) or right (clockwise), adjust the angle offset.

**Location in script.js:** Find the `getBranchAngleOffset` function (around line 871)

**Example - Moving BHUSHAN to the right:**

```javascript
// Add this in the getBranchAngleOffset function (around line 920)
if (person.name === "BHUSHAN" && person.generation === 24 &&
    JSON.stringify(person.parents) === JSON.stringify([1, 1, 1, 1, 4, 1, 3, 3, 1, 1, 4, 1, 2, 1, 2])) {
    return -0.15; // Negative = clockwise (right), Positive = anticlockwise (left)
}
```

**Offset values:**
- `-0.3` = Move far clockwise (right)
- `-0.15` = Move moderately clockwise (right)
- `0.0` = No offset (default)
- `0.15` = Move moderately anticlockwise (left)
- `0.3` = Move far anticlockwise (left)

**Example - Moving all children of YASH to the left:**

```javascript
// Match all children by their parent path
if (person.generation === 24 &&
    JSON.stringify(person.parents.slice(0, 14)) === JSON.stringify([1, 1, 1, 1, 4, 1, 3, 3, 1, 1, 4, 1, 2, 1])) {
    return 0.12; // Move all YASH's children anticlockwise (left)
}
```

### Complete Example: Adding Multiple Siblings

**Scenario:** Add three children to VISHAL (generation 23): CHILD1, CHILD2, CHILD3

**Step 1 - Add nodes (in familyData array, around line 523):**
```javascript
{ name: "VISHAL", generation: 23, parents: [1, 1, 1, 1, 4, 1, 3, 3, 1, 1, 4, 1, 3, 1] },
// Add three children:
{ name: "CHILD1", generation: 24, parents: [1, 1, 1, 1, 4, 1, 3, 3, 1, 1, 4, 1, 3, 1, 1] },
{ name: "CHILD2", generation: 24, parents: [1, 1, 1, 1, 4, 1, 3, 3, 1, 1, 4, 1, 3, 1, 2] },
{ name: "CHILD3", generation: 24, parents: [1, 1, 1, 1, 4, 1, 3, 3, 1, 1, 4, 1, 3, 1, 3] },
```

**Step 2 - Adjust spacing (in spreadAngle section, around line 3440):**
```javascript
} else if (JSON.stringify(person.parents.slice(0, 14)) === JSON.stringify([1, 1, 1, 1, 4, 1, 3, 3, 1, 1, 4, 1, 3, 1])) {
    spreadAngle = minSpread * 0.85; // Tighter spacing for VISHAL's three children
```

**Step 3 - Move entire group left (in getBranchAngleOffset function, around line 980):**
```javascript
// Move all VISHAL's children anticlockwise (left)
if (person.generation === 24 &&
    JSON.stringify(person.parents.slice(0, 14)) === JSON.stringify([1, 1, 1, 1, 4, 1, 3, 3, 1, 1, 4, 1, 3, 1])) {
    return 0.10; // Small anticlockwise offset
}
```

### Tips

- **Always save and refresh** your browser to see changes
- **Use the same parent path length** when matching with `slice()` - e.g., `slice(0, 14)` for generation 24
- **Start with small offset values** (0.05-0.10) and adjust incrementally
- **Test one change at a time** to see the effect clearly

## Technical Details

- Built with vanilla JavaScript (no frameworks)
- Uses SVG for scalable graphics
- Responsive canvas sizing
- Dynamic node positioning algorithm
- Edge-to-edge arrow connections

## License

Free to use and modify for personal or commercial projects.

---

## Welcome Page: The Physics of Family

The welcome page (`welcome.html`) features a carefully curated collection of fundamental equations from physics and mathematics that bridge the cosmic and the personal. Each equation represents a different scale of existence, culminating in a custom equation that connects the mathematical universe to the human experience of family.

### The Equations

**1. U(1) Gauge Lagrangian for a Scalar Field**
```
ℒ = -¼ F_μν F^μν + (D_μ φ)† (D^μ φ) - m²|φ|² - λ|φ|⁴
```
The foundation of quantum field theory, describing how fundamental particles interact through gauge forces. This represents the quantum realm—the smallest scales of reality where particles emerge from fields.

**2. Einstein-Maxwell Lagrangian**
```
ℒ = √(-g) [R/(16πG) - ¼ F^μν F_μν]
```
Combines Einstein's general relativity with Maxwell's electromagnetism, showing how electromagnetic fields propagate through curved spacetime. This bridges quantum electromagnetism with gravitational curvature.

**3. Feynman Path Integral for QED**
```
Z = ∫ [DA_μ][Dψ][Dψ̄] exp(i∫d⁴x ℒ_QED/ℏ)
```
Feynman's revolutionary formulation of quantum electrodynamics—summing over all possible quantum histories. Every particle explores every possible path through spacetime simultaneously, with reality emerging from this infinite superposition.

**4. Einstein Tensor**
```
G_μν = R_μν - ½g_μν R
```
The left-hand side of Einstein's field equations, encoding the curvature of spacetime itself. This is how mass and energy warp the fabric of the universe.

**5. Christoffel Symbols**
```
Γ^σ_μν = ½g^σρ(∂_μ g_νρ + ∂_ν g_μρ - ∂_ρ g_μν)
```
The mathematical machinery of curved spacetime—how vectors change as they're transported through gravity's influence. These symbols encode the "connection" that tells particles how to move through curved space.

**6. The Family Equation** ⚡
```
ℱ = ∑_(i=1)^∞ G_i(L,M,T)
```
**ℱ (Family)** is the infinite sum across all **Generations** (G_i), each parameterized by three fundamental forces:
- **L (Love)** - the binding energy that holds generations together
- **M (Memory)** - the information that propagates through time
- **T (Time)** - the dimension through which family unfolds

Just as particles sum over all quantum paths in Feynman's integral, family is the sum over all generations—each generation a node in spacetime, connected by bonds of love, memory, and time.

**7. Friedmann-Robertson-Walker Metric**
```
ds² = -c²dt² + a(t)²[dr²/(1-kr²) + r²(dθ² + sin²θ dφ²)]
```
The metric of the expanding universe in cosmology. The scale factor **a(t)** describes how the universe grows through cosmic time. Just as this metric describes cosmic expansion, the family equation describes generational expansion—both are stories of growth, branching, and evolution through time.

### The Hidden Gateway

The infinity symbol (∞) in the family equation serves as the entry point to the website. This is not accidental—clicking infinity to enter the family tree represents:
- The **infinite generations** that came before us
- The **infinite potential** of future generations
- The **unbounded love** that transcends time
- The **eternal nature** of family bonds across the ages

### From Quantum to Cosmic to Human

These equations trace a journey through scales:
1. **Quantum fields** (10^-18 m) - the fundamental particles
2. **Electromagnetic forces** - the interactions that build matter
3. **Curved spacetime** - the arena where physics unfolds
4. **The expanding universe** (10^26 m) - the largest structures
5. **Family** - the human experience that gives meaning to it all

We are star stuff contemplating star stuff, as Carl Sagan said. These equations show how physics describes reality from the smallest to the largest scales. But the family equation reminds us that the most important structures aren't measured in Planck lengths or megaparsecs—they're measured in love, memory, and time across generations.

The welcome page is thus a meditation: from the quantum foam to the cosmic web, and finally to the human web of connection that is family. Physics describes *what is*, but family gives it *meaning*.
