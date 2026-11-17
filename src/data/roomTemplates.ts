// ==============================================================================
// APNI ESTATE INTERIORS - ROOM-WISE COST TEMPLATES & STANDARD SCOPE
// Realistic Indian interior design pricing, common itemized lines & sq.ft rates
// ==============================================================================

export type RoomExecutionStatus = 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';

export const EXECUTION_STATUSES: RoomExecutionStatus[] = [
  'Not Started',
  'In Progress',
  'Completed',
  'On Hold'
];

export interface RoomTemplateItem {
  item_name: string;
  category: 'Carpentry' | 'Civil Work' | 'Electrical' | 'Painting' | 'Plumbing' | 'Miscellaneous';
  quantity: number;
  unit: string;
  rate: number;
  description: string;
}

export interface RoomTemplate {
  id: string;
  name: string;
  room_type: string;
  default_sqft: number;
  default_rate_per_sqft: number;
  badge: string;
  items: RoomTemplateItem[];
}

export const ROOM_TEMPLATES: RoomTemplate[] = [
  {
    id: 'living-room',
    name: 'Living Room',
    room_type: 'Living Room',
    default_sqft: 220,
    default_rate_per_sqft: 250,
    badge: 'Standard ~220 sqft',
    items: [
      {
        item_name: 'Gypsum False Ceiling with Warm LED Coves',
        category: 'Civil Work',
        quantity: 220,
        unit: 'Sq.Ft',
        rate: 135,
        description: 'Saint-Gobain gypsum board with concealed channels and 3000K warm white LED strip lights.'
      },
      {
        item_name: 'Designer TV Console & Fluted Acoustic Paneling',
        category: 'Carpentry',
        quantity: 1,
        unit: 'Lot',
        rate: 45000,
        description: 'Charcoal fluted louvers, floating storage console with wire management and PU finish.'
      },
      {
        item_name: 'Vitrified Floor Tiling (4x2 GVT Slabs)',
        category: 'Civil Work',
        quantity: 220,
        unit: 'Sq.Ft',
        rate: 120,
        description: 'Supplying and laying 1200x600mm glazed vitrified tiles with epoxy spacer grouting.'
      },
      {
        item_name: 'Asian Paints Royale Luxury Emulsion',
        category: 'Painting',
        quantity: 550,
        unit: 'Sq.Ft',
        rate: 35,
        description: '2 coats acrylic putty, 1 coat primer, and 2 coats Royale luxury emulsion with roller finish.'
      },
      {
        item_name: 'Modular Switchboards & Mood Lighting Wiring',
        category: 'Electrical',
        quantity: 1,
        unit: 'Lot',
        rate: 18000,
        description: 'Finolex FR wiring, Schneider modular switch plates, and magnetic track light points.'
      }
    ]
  },
  {
    id: 'master-bedroom',
    name: 'Master Bedroom',
    room_type: 'Master Bedroom',
    default_sqft: 180,
    default_rate_per_sqft: 280,
    badge: 'Standard ~180 sqft',
    items: [
      {
        item_name: 'Full-Height Sliding Wardrobe with Loft',
        category: 'Carpentry',
        quantity: 90,
        unit: 'Sq.Ft',
        rate: 1950,
        description: 'Commercial BWP ply, 1mm Merino laminate inside & out, soft-close sliding tracks & integrated profile LED.'
      },
      {
        item_name: 'King Bed with Cushioned Headboard & Hydraulic Storage',
        category: 'Carpentry',
        quantity: 1,
        unit: 'Lot',
        rate: 48000,
        description: 'Heavy-duty hydraulic lift frame, premium upholstery fabric headboard, and mattress support.'
      },
      {
        item_name: 'Twin Bedside Floating Nightstands',
        category: 'Carpentry',
        quantity: 1,
        unit: 'Lot',
        rate: 12000,
        description: 'Pair of cantilevered bedside drawers with push-to-open channels and matching laminate.'
      },
      {
        item_name: 'Gypsum Ceiling with Perimeter Magnetic Profile',
        category: 'Civil Work',
        quantity: 180,
        unit: 'Sq.Ft',
        rate: 145,
        description: 'Concealed gypsum ceiling with 16mm recessed black magnetic track light fixture.'
      },
      {
        item_name: 'Vanity Dressing Unit with Backlit LED Mirror',
        category: 'Carpentry',
        quantity: 1,
        unit: 'Lot',
        rate: 18000,
        description: 'Wall-mounted cosmetics organizer drawer and 5mm Saint-Gobain mirror with touch sensor LED.'
      }
    ]
  },
  {
    id: 'bedroom',
    name: 'Kids / Guest Bedroom',
    room_type: 'Bedroom',
    default_sqft: 140,
    default_rate_per_sqft: 250,
    badge: 'Standard ~140 sqft',
    items: [
      {
        item_name: '3-Door Hinged Wardrobe with Loft',
        category: 'Carpentry',
        quantity: 60,
        unit: 'Sq.Ft',
        rate: 1750,
        description: 'MR grade ply with soft-close hinges, internal hanging rods, and lockable jewelry locker.'
      },
      {
        item_name: 'Queen Bed with Box Storage',
        category: 'Carpentry',
        quantity: 1,
        unit: 'Lot',
        rate: 35000,
        description: 'Sturdy ply frame with dual storage boxes, edge-banded ply top, and laminate headboard.'
      },
      {
        item_name: 'Study Desk with Overhead Book Rack',
        category: 'Carpentry',
        quantity: 1,
        unit: 'Lot',
        rate: 22000,
        description: '4ft ergonomic study desk with stationery drawer, wire grommet, and dual display shelves.'
      },
      {
        item_name: 'Premium Acrylic Emulsion Wall Painting',
        category: 'Painting',
        quantity: 420,
        unit: 'Sq.Ft',
        rate: 28,
        description: 'Putty finish, primer, and two coats of washable acrylic emulsion.'
      }
    ]
  },
  {
    id: 'kitchen',
    name: 'Modular Kitchen',
    room_type: 'Kitchen',
    default_sqft: 90,
    default_rate_per_sqft: 450,
    badge: 'Standard ~90 sqft',
    items: [
      {
        item_name: 'BWP Marine Ply Base Cabinets (Acrylic Finish)',
        category: 'Carpentry',
        quantity: 36,
        unit: 'Sq.Ft',
        rate: 1850,
        description: 'IS 710 calibrated marine ply with 1.5mm high-gloss anti-scratch acrylic shutters.'
      },
      {
        item_name: 'Overhead Wall Units with Hydraulic Lift-ups',
        category: 'Carpentry',
        quantity: 28,
        unit: 'Sq.Ft',
        rate: 1650,
        description: 'Wall-mounted cabinets with Aventos HF bi-fold lift systems and bottom profile lighting.'
      },
      {
        item_name: 'Hafele Soft-Close Tandem Baskets & Organizers',
        category: 'Carpentry',
        quantity: 1,
        unit: 'Lot',
        rate: 32000,
        description: 'Cutlery tray, cup & saucer basket, thali pull-out, and bottle pullout with 45kg load rating.'
      },
      {
        item_name: 'Composite Quartz Countertop with Edge Chamfering',
        category: 'Civil Work',
        quantity: 45,
        unit: 'Sq.Ft',
        rate: 380,
        description: 'Non-porous quartz slab with double bull-nose edge polishing and sink cutout.'
      },
      {
        item_name: 'Designer Backsplash Tiling & Chimney Ducting',
        category: 'Civil Work',
        quantity: 1,
        unit: 'Lot',
        rate: 18000,
        description: 'Moroccan/subway backsplash tiles up to 2ft height and core cutting for 6-inch chimney duct.'
      }
    ]
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    room_type: 'Bathroom',
    default_sqft: 45,
    default_rate_per_sqft: 350,
    badge: 'Standard ~45 sqft',
    items: [
      {
        item_name: 'Vanity Under-Counter Cabinet & Mirror',
        category: 'Carpentry',
        quantity: 1,
        unit: 'Lot',
        rate: 18000,
        description: 'Waterproof HDHMR vanity with soft-close drawer and mirror storage unit.'
      },
      {
        item_name: 'Full-Height Designer Wall Tile Cladding',
        category: 'Civil Work',
        quantity: 180,
        unit: 'Sq.Ft',
        rate: 95,
        description: 'Laying 2x1 ceramic/vitrified wall tiles up to false ceiling height with waterproof grouting.'
      },
      {
        item_name: 'CP Sanitaryware & Diverter Installation',
        category: 'Plumbing',
        quantity: 1,
        unit: 'Lot',
        rate: 25000,
        description: 'Kohler/Jaquar wall-hung WC, concealed flush cistern, overhead shower, and basin diverter.'
      },
      {
        item_name: 'Moisture-Resistant False Ceiling with Exhaust',
        category: 'Civil Work',
        quantity: 1,
        unit: 'Lot',
        rate: 8500,
        description: 'Calcium silicate/PVC grid ceiling with IP65 downlight and high-CFM exhaust fan.'
      }
    ]
  },
  {
    id: 'dining-foyer',
    name: 'Dining & Entry Foyer',
    room_type: 'Dining Room',
    default_sqft: 120,
    default_rate_per_sqft: 220,
    badge: 'Standard ~120 sqft',
    items: [
      {
        item_name: 'Dining Crockery Credenza with Fluted Glass',
        category: 'Carpentry',
        quantity: 1,
        unit: 'Lot',
        rate: 36000,
        description: 'Storage unit with tinted glass shutters, internal warm strip lights, and wine bottle rack.'
      },
      {
        item_name: 'Entry Foyer Shoe Console & Key Drop',
        category: 'Carpentry',
        quantity: 1,
        unit: 'Lot',
        rate: 24000,
        description: 'Ventilated shoe organizer with seating cushion, back paneling, and coat hooks.'
      },
      {
        item_name: 'Dining Accent Feature Wall Paneling',
        category: 'Carpentry',
        quantity: 45,
        unit: 'Sq.Ft',
        rate: 180,
        description: 'Veneer/charcoal paneling with vertical brass inlay T-profiles.'
      }
    ]
  },
  {
    id: 'balcony',
    name: 'Balcony / Deck',
    room_type: 'Balcony',
    default_sqft: 60,
    default_rate_per_sqft: 180,
    badge: 'Standard ~60 sqft',
    items: [
      {
        item_name: 'Anti-Skid Wooden Texture Deck Tiles',
        category: 'Civil Work',
        quantity: 60,
        unit: 'Sq.Ft',
        rate: 110,
        description: 'Interlocking exterior grade composite deck tiles over existing slope.'
      },
      {
        item_name: 'Weatherproof Exterior Wall Texture & Paint',
        category: 'Painting',
        quantity: 150,
        unit: 'Sq.Ft',
        rate: 32,
        description: 'Asian Paints Apex Ultima exterior weather defense paint with silicone primer.'
      },
      {
        item_name: 'Vertical Garden Artificial Green Wall & Planter Railing',
        category: 'Miscellaneous',
        quantity: 1,
        unit: 'Lot',
        rate: 15000,
        description: 'UV-stabilized vertical foliage wall matting and powder-coated railing planter troughs.'
      }
    ]
  }
];

export function calculateRoomBudget(area_sqft: number, rate_per_sqft: number): number {
  const sqft = Math.max(0, Number(area_sqft) || 0);
  const rate = Math.max(0, Number(rate_per_sqft) || 0);
  return Math.round(sqft * rate);
}
