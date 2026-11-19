import type { PresetId } from "@/lib/presets";

type ProductArtworkProps = {
  preset: PresetId;
  productId: string;
};

const illustrations = {
  classic: [
    <g key="mug">
      <path d="M91 83h79l-9 91a15 15 0 0 1-15 13h-31a15 15 0 0 1-15-13l-9-91Z" />
      <path d="M170 98h13a20 20 0 0 1 0 40h-17M105 69h51" />
      <path d="M113 53c-7-8 7-12 0-20m22 20c-7-8 7-12 0-20" />
    </g>,
    <g key="bag">
      <path d="M83 91h96l-8 88H91l-8-88Z" />
      <path d="M108 95V76a23 23 0 0 1 46 0v19M103 112h56" />
    </g>,
    <g key="gift">
      <path d="M77 106h108v75H77v-75Zm-10-25h128v27H67V81Z" />
      <path d="M131 81v100m0-100c-35 2-38-33-16-29 12 2 16 18 16 29Zm0 0c35 2 38-33 16-29-12 2-16 18-16 29Z" />
    </g>,
  ],
  nabd: [
    <g key="dumbbell">
      <path d="M72 106h28v48H72v-48Zm100 0h28v48h-28v-48ZM100 119h72v22h-72v-22Z" />
      <path d="M61 117v26m150-26v26" />
    </g>,
    <g key="shoe">
      <path d="M77 150c20-2 34-15 43-38l19 11c11 7 19 18 31 21l26 7c9 3 13 12 10 21H79c-10 0-15-13-2-22Z" />
      <path d="m122 119 11 17m3-14 11 16m-54 24h113" />
    </g>,
    <g key="bottle">
      <path d="M113 58h37v18l12 15v81a18 18 0 0 1-18 18h-25a18 18 0 0 1-18-18V91l12-15V58Z" />
      <path d="M112 108h39m-39 14h39" />
    </g>,
  ],
  fashion: [
    <g key="dress">
      <path d="M122 63a10 10 0 1 1 20 0v13l22 17-11 20 20 61H91l20-61-11-20 22-17V63Z" />
      <path d="m110 113 22 11 22-11" />
    </g>,
    <g key="fashion-bag">
      <path d="M82 97h100l-8 83H90l-8-83Z" />
      <path d="M108 99V79a24 24 0 0 1 48 0v20m-53 20h58" />
    </g>,
    <g key="hanger">
      <path d="M132 64a12 12 0 0 0-12 12m12-12a8 8 0 1 1 8 8v12L76 137c-9 7-4 18 7 18h99c11 0 16-11 7-18l-64-53" />
    </g>,
  ],
  furniture: [
    <g key="sofa">
      <path d="M77 125a18 18 0 0 1 36 0v14h58v-14a18 18 0 0 1 36 0v37h-21v25H98v-25H77v-37Z" />
      <path d="M77 151h130m-94-12v-14m58 14v-14" />
    </g>,
    <g key="lamp">
      <path d="m96 80 37-30 37 30-10 45h-54L96 80Zm37 45v52m-30 0h60" />
      <path d="M110 91h46" />
    </g>,
    <g key="chair">
      <path d="M100 54h64v76h-64V54Zm-14 76h92v33H86v-33Zm12 33-8 27m84-27 8 27" />
      <path d="M110 66v52m44-52v52" />
    </g>,
  ],
  "local-brand": [
    <g key="shirt">
      <path d="m103 66 29-15 29 15 29 22-17 26-16-10v71H105V104l-16 10-17-26 31-22Z" />
      <path d="m115 60 17 20 17-20m-44 44h54" />
    </g>,
    <g key="cap">
      <path d="M81 132a51 51 0 0 1 102 0H81Z" />
      <path d="M81 132c-17 0-24 13-13 22h122c11-9 4-22-13-22m-44-44v36" />
    </g>,
    <g key="brand-tag">
      <path d="M76 76h67l47 47-66 66-48-47V76Z" />
      <circle cx="103" cy="104" r="7" />
      <path d="m119 132 32 32m-32-14 20 20" />
    </g>,
  ],
} as const;

export function ProductArtwork({ preset, productId }: ProductArtworkProps) {
  const index = Number(productId.match(/\d+$/)?.[0] ?? 0) % 3;

  return (
    <span aria-hidden="true" className={`product-art product-art-${preset}`}>
      <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 264 224">
        <path className="product-art-backdrop" d="M31 163c9-54 39-89 95-94 54-5 98 29 108 90 5 31-21 44-48 44H77c-33 0-52-13-46-40Z" />
        {illustrations[preset][index]}
      </svg>
    </span>
  );
}
