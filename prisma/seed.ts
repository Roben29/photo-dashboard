import { db } from "../src/lib/db";

async function main() {
  // Clear existing
  await db.asset.deleteMany({});

  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000);

  const samples = [
    {
      fileName: "cyborg-warrior.png",
      fileSizeBytes: 4_582_144,
      fileExtension: "png",
      storageUrl: "/uploads/sample-character.png",
      thumbnailUrl: "/uploads/sample-character.png",
      title: "Cybernetic Warrior Bust",
      category: "Character",
      description:
        "High-detail cyborg character concept rendered in Octane. Designed as a protagonist reference for a short sci-fi film. The visor uses an emissive shader and the panel lines were baked from a ZBrush high-poly.",
      promptUsed:
        "futuristic cyborg character, half-human half-machine, glowing cyan visor, intricate mechanical joints, octane render, cinematic rim lighting, 8k, hyper detailed --ar 2:3 --stylize 750",
      referenceWebsites: [
        "https://www.artstation.com/",
        "https://sketchfab.com/3d-models/characters",
        "https://civitai.com/",
      ],
      workflowNotes:
        "1. Blockout in Blender\n2. Detail pass in ZBrush\n3. Retopo + UV in Maya\n4. Bake maps in Substance Painter\n5. Final render Octane",
      authorName: "Maya Chen",
      createdAt: daysAgo(2),
    },
    {
      fileName: "alien-vista.png",
      fileSizeBytes: 6_201_344,
      fileExtension: "png",
      storageUrl: "/uploads/sample-environment.png",
      thumbnailUrl: "/uploads/sample-environment.png",
      title: "Alien Planet Vista",
      category: "Environment",
      description:
        "Matte painting exploration for an alien world establishing shot. Volumetric atmosphere was built in Houdini then composited in Nuke.",
      promptUsed:
        "alien planet landscape, twin moons, volumetric fog, bioluminescent flora, dramatic god rays, cinematic wide shot, digital painting, Greg Rutkowski style --ar 16:9",
      referenceWebsites: [
        "https://www.artstation.com/blogs",
        "https://www.behance.net/",
      ],
      workflowNotes:
        "Generated base in Stable Diffusion XL, upscaled 4x, then painted over the foreground rocks manually.",
      authorName: "Devon Park",
      createdAt: daysAgo(5),
    },
    {
      fileName: "dragon-head-sculpt.png",
      fileSizeBytes: 3_910_656,
      fileExtension: "png",
      storageUrl: "/uploads/sample-creature.png",
      thumbnailUrl: "/uploads/sample-creature.png",
      title: "Dragon Head Sculpt",
      category: "Creature",
      description:
        "Creature design sculpt used as a reference for a game boss asset. Scales were done with an alpha brush set.",
      promptUsed:
        "dragon head sculpt, intricate scales, horns, ZBrush BPR render, dramatic lighting, dark background, creature concept art --ar 1:1",
      referenceWebsites: [
        "https://www.zbrushcentral.com/",
        "https://www.artstation.com/creature",
      ],
      workflowNotes: "ZBrush sculpt -> Polypaint -> BPR render -> Photoshop comp.",
      authorName: "Priya Rao",
      createdAt: daysAgo(8),
    },
    {
      fileName: "iridescent-shapes.png",
      fileSizeBytes: 2_340_992,
      fileExtension: "png",
      storageUrl: "/uploads/sample-abstract.png",
      thumbnailUrl: "/uploads/sample-abstract.png",
      title: "Iridescent Abstract Composition",
      category: "Abstract",
      description:
        "Abstract render exploring thin-film interference shaders on procedural geometry. Created for a motion graphics title sequence.",
      promptUsed:
        "abstract 3D geometric render, iridescent metallic shapes, studio lighting, gradient background, octane, glossy, ultra detailed --ar 1:1",
      referenceWebsites: ["https://www.patreon.com/octane"],
      workflowNotes:
        "Octane scatter + thin-film material on a displacement sphere. Animated over 240 frames.",
      authorName: "Leo Martinez",
      createdAt: daysAgo(12),
    },
    {
      fileName: "crystal-shard.obj",
      fileSizeBytes: 550,
      fileExtension: "obj",
      storageUrl: "/uploads/sample-crystal.obj",
      thumbnailUrl: null,
      title: "Low-Poly Crystal Shard",
      category: "3D Prop",
      description:
        "Game-ready low-poly crystal prop. 10 vertices, hand-authored geometry suitable for mobile AR scenes.",
      promptUsed: "",
      referenceWebsites: ["https://poly.pizza/", "https://opengameart.org/"],
      workflowNotes: "Hand-authored OBJ, no textures needed, vertex colors only.",
      authorName: "Maya Chen",
      createdAt: daysAgo(1),
    },
    {
      fileName: "mechanical-gear.stl",
      fileSizeBytes: 2872,
      fileExtension: "stl",
      storageUrl: "/uploads/sample-gear.stl",
      thumbnailUrl: null,
      title: "Mechanical Gear",
      category: "3D Prop",
      description:
        "Printable mechanical gear STL for a prototyping project. Validated in Cura before slicing.",
      promptUsed: "",
      referenceWebsites: ["https://www.thingiverse.com/"],
      workflowNotes: "Modeled in Fusion 360, exported as ASCII STL.",
      authorName: "Devon Park",
      createdAt: daysAgo(3),
    },
    {
      fileName: "hero-rigged-character.fbx",
      fileSizeBytes: 18_452_992,
      fileExtension: "fbx",
      storageUrl: "/uploads/sample-crystal.obj",
      thumbnailUrl: "/uploads/sample-character.png",
      title: "Hero Rigged Character (FBX)",
      category: "Rigged Character",
      description:
        "Fully rigged hero character with facial blendshapes. Binary FBX, 24k tris. Drop into Unreal or Unity directly.",
      promptUsed: "",
      referenceWebsites: [
        "https://www.mixamo.com/",
        "https://docs.unrealengine.com/",
      ],
      workflowNotes:
        "Rigged in Maya with Advanced Skeleton. Test-imported in UE5.2 and Unity 2022 LTS.",
      authorName: "Priya Rao",
      createdAt: daysAgo(15),
    },
    {
      fileName: "stage-collision.usd",
      fileSizeBytes: 42_883_072,
      fileExtension: "usd",
      storageUrl: "/uploads/sample-gear.stl",
      thumbnailUrl: "/uploads/sample-environment.png",
      title: "Stage Collision USD",
      category: "Scene",
      description:
        "USD stage containing collision geometry for a virtual production set. Layered with references to separate asset layers.",
      promptUsed: "",
      referenceWebsites: ["https://openusd.org/", "https://developer.apple.com/augmented-reality/quick-look/"],
      workflowNotes: "Authored in USD Composer. Payloads set to load on demand.",
      authorName: "Leo Martinez",
      createdAt: daysAgo(20),
    },
    {
      fileName: "fx-sim-cache.abc",
      fileSizeBytes: 128_402_432,
      fileExtension: "abc",
      storageUrl: "/uploads/sample-gear.stl",
      thumbnailUrl: "/uploads/sample-abstract.png",
      title: "Fluid Sim Cache (Alembic)",
      category: "Simulation",
      description:
        "Alembic point cache of a splash simulation. 480 frames of particle data. Use for lookdev or final comp.",
      promptUsed: "",
      referenceWebsites: ["https://www.sidefx.com/docs/houdini/"],
      workflowNotes: "Simulated in Houdini FLIP, cached at 48fps.",
      authorName: "Devon Park",
      createdAt: daysAgo(25),
    },
  ];

  for (const s of samples) {
    await db.asset.create({
      data: {
        ...s,
        referenceWebsites: JSON.stringify(s.referenceWebsites),
      },
    });
  }

  console.log(`Seeded ${samples.length} sample assets.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
