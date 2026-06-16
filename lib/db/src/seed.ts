import { db } from "./index";
import { vendorsTable, productsTable } from "./schema";

async function seed() {
  console.log("Seeding vendors...");

  await db.delete(productsTable);
  await db.delete(vendorsTable);

  const vendors = await db
    .insert(vendorsTable)
    .values([
      {
        name: "Bellini Baking Co.",
        contactName: "Maria Bellini",
        email: "maria@bellinibaking.com",
        description:
          "Stone-oven sourdoughs, focaccia, and seasonal pastries baked in small batches every Wednesday night for Thursday market. Each loaf is made with heritage grain and a 48-hour cold ferment.",
        location: "Melrose, MA",
        website: "https://www.bellinibakingco.com/",
        instagram: "@bellinibakingco",
        launchMode: "reserve_for_pickup",
        status: "live",
        marketDates: "Thursday, June 18",
        pickupInstructions: "Pick up at the Bellini Baking table, near the east entrance. Bring your reservation code.",
      },
      {
        name: "Del Sur Empanadas",
        contactName: "Carlos & Ana Suarez",
        email: "hola@delsurempanadas.com",
        description:
          "Argentinian empanadas made fresh every market morning — beef & chimichurri, roasted corn & poblano, and rotating seasonal specials. Vegetarian and gluten-free options available.",
        location: "Stoneham, MA",
        website: "https://delsurnatural.com",
        instagram: "@delsurempanadas",
        launchMode: "reserve_for_pickup",
        status: "live",
        marketDates: "Thursday, June 18",
        pickupInstructions: "Hot empanadas are ready by 9am. Show your code at pickup — quantities are limited.",
      },
      {
        name: "Wilmington Honey Bee",
        contactName: "James Alvarez",
        email: "james@wilmingtonhoneybee.com",
        description:
          "Hyper-local raw honey from hives maintained on wildflower meadows in Wilmington and Woburn. Also beeswax candles, lip balms, and seasonal creamed honey varieties.",
        location: "Wilmington, MA",
        website: "https://wilmingtonhoneybee.com",
        instagram: "@wilmingtonhoneybee",
        launchMode: "reserve_for_pickup",
        status: "live",
        marketDates: "Thursday, June 18",
        pickupInstructions: "Look for the yellow banner near the main entrance.",
      },
      {
        name: "Crave Creations",
        contactName: "Sophie Chen",
        email: "sophie@cravecreations.com",
        description:
          "Handcrafted chocolates, truffles, and confections made in small batches with ethically-sourced cacao. Seasonal bark, caramels, and signature gift boxes.",
        location: "Winchester, MA",
        instagram: "@cravecreations_ma",
        launchMode: "featured_products",
        status: "live",
        marketDates: "Thursday, June 18",
      },
      {
        name: "Spice Weasel Sauce",
        contactName: "Tom Nguyen",
        email: "tom@spiceweasel.com",
        description:
          "Small-batch craft hot sauces and fermented chili condiments — from gentle summer warmth to face-melting infernos. All natural, no preservatives, made in Woburn.",
        location: "Woburn, MA",
        website: "https://spiceweaselsauce.com",
        instagram: "@spiceweaselsauce",
        launchMode: "reserve_for_pickup",
        status: "live",
        marketDates: "Thursday, June 18",
        pickupInstructions: "First come, first served on walk-ins. Reserved bottles are held until 10:30am.",
      },
      {
        name: "Teresa's Farm",
        contactName: "Teresa Novak",
        website: "https://teresa-farm.com",
        description:
          "Fourth-generation family farm in Reading raising heritage breed chickens, ducks, and turkeys on open pasture. Offering seasonal vegetables, fresh eggs, and cut flowers.",
        location: "Reading, MA",
        launchMode: "featured_products",
        status: "live",
        marketDates: "Thursday, June 18",
      },
      {
        name: "Riverdale Farm",
        contactName: "Ed and Pat Rivera",
        description:
          "Certified organic vegetables, herbs, and edible flowers grown on 12 acres in North Reading. Seasonal CSA shares available — ask at the table.",
        location: "North Reading, MA",
        launchMode: "featured_products",
        status: "live",
        marketDates: "Thursday, June 18",
      },
      {
        name: "Aaronap Cellars",
        contactName: "Aaron Parker",
        description:
          "Estate-grown wines from a working vineyard in Stoneham's western hills. Dry whites, rosés, and a signature semi-sweet apple-grape blend made from heritage orchard fruit.",
        location: "Stoneham, MA",
        website: "https://aaronapcellars.com",
        instagram: "@aaronapcellars",
        launchMode: "profile_only",
        status: "live",
        marketDates: "Thursday, June 18",
      },
    ])
    .returning();

  console.log(`Inserted ${vendors.length} vendors.`);

  const vendorMap = Object.fromEntries(vendors.map((v) => [v.name, v.id]));

  const products = await db
    .insert(productsTable)
    .values([
      // Bellini Baking Co.
      {
        vendorId: vendorMap["Bellini Baking Co."],
        name: "Country Sourdough Loaf",
        description: "Heritage wheat, sea salt, and 48-hour cold ferment. One 1.5lb loaf.",
        price: "$10",
        reservationAllowed: true,
        maxPerReservation: 3,
        quantityAvailable: 30,
        status: "live",
      },
      {
        vendorId: vendorMap["Bellini Baking Co."],
        name: "Rosemary Focaccia",
        description: "Olive oil, sea salt, fresh rosemary. Full sheet serves 6–8.",
        price: "$12",
        reservationAllowed: true,
        maxPerReservation: 2,
        quantityAvailable: 15,
        status: "live",
      },
      {
        vendorId: vendorMap["Bellini Baking Co."],
        name: "Seasonal Pastry Box",
        description: "Assorted pastries baked the morning of market day. Contents change weekly.",
        price: "$14",
        reservationAllowed: true,
        maxPerReservation: 2,
        quantityAvailable: 20,
        status: "live",
      },
      // Del Sur Empanadas
      {
        vendorId: vendorMap["Del Sur Empanadas"],
        name: "Beef & Chimichurri (6-pack)",
        description: "Classic Argentinian beef with house-made chimichurri. Baked, not fried.",
        price: "$16",
        reservationAllowed: true,
        maxPerReservation: 3,
        quantityAvailable: 40,
        status: "live",
      },
      {
        vendorId: vendorMap["Del Sur Empanadas"],
        name: "Roasted Corn & Poblano (6-pack)",
        description: "Vegetarian. Roasted corn, poblano pepper, queso fresco.",
        price: "$15",
        reservationAllowed: true,
        maxPerReservation: 3,
        quantityAvailable: 30,
        status: "live",
        allergenNote: "Contains dairy",
      },
      // Wilmington Honey Bee
      {
        vendorId: vendorMap["Wilmington Honey Bee"],
        name: "Wildflower Raw Honey (1lb)",
        description: "Unfiltered raw honey from Wilmington wildflower meadows. Single-origin, small batch.",
        price: "$14",
        reservationAllowed: true,
        maxPerReservation: 4,
        quantityAvailable: 50,
        status: "live",
      },
      {
        vendorId: vendorMap["Wilmington Honey Bee"],
        name: "Creamed Honey (8oz)",
        description: "Whipped to a spreadable consistency. Current flavor: Cinnamon & Vanilla.",
        price: "$10",
        reservationAllowed: true,
        maxPerReservation: 3,
        quantityAvailable: 25,
        status: "live",
      },
      {
        vendorId: vendorMap["Wilmington Honey Bee"],
        name: "Beeswax Candle Set",
        description: "Two hand-poured beeswax pillars with natural honey scent.",
        price: "$18",
        reservationAllowed: true,
        maxPerReservation: 2,
        quantityAvailable: 20,
        status: "live",
      },
      // Crave Creations (featured, no reservations)
      {
        vendorId: vendorMap["Crave Creations"],
        name: "Dark Chocolate Truffle Box (6pc)",
        description: "Six seasonal truffles in a gift box. Flavors rotate weekly.",
        price: "$16",
        reservationAllowed: false,
        status: "live",
        allergenNote: "Contains dairy, may contain nuts",
      },
      {
        vendorId: vendorMap["Crave Creations"],
        name: "Sea Salt Caramel Bark",
        description: "Dark chocolate bark with house-made caramel and fleur de sel.",
        price: "$12",
        reservationAllowed: false,
        status: "live",
        allergenNote: "Contains dairy",
      },
      // Spice Weasel Sauce
      {
        vendorId: vendorMap["Spice Weasel Sauce"],
        name: "Smoky Habanero (5oz)",
        description: "Habanero, roasted tomato, smoked paprika. Medium-hot, rich and fruity.",
        price: "$9",
        reservationAllowed: true,
        maxPerReservation: 6,
        quantityAvailable: 60,
        status: "live",
      },
      {
        vendorId: vendorMap["Spice Weasel Sauce"],
        name: "Jalapeño Verde (5oz)",
        description: "Green jalapeño, tomatillo, and lime. Tangy and versatile.",
        price: "$9",
        reservationAllowed: true,
        maxPerReservation: 6,
        quantityAvailable: 60,
        status: "live",
      },
      {
        vendorId: vendorMap["Spice Weasel Sauce"],
        name: "The Scorpion (5oz)",
        description: "Trinidad moruga scorpion peppers. For the brave. No complaints accepted.",
        price: "$11",
        reservationAllowed: true,
        maxPerReservation: 4,
        quantityAvailable: 30,
        status: "live",
      },
      // Riverdale Farm (featured organic produce, no reservations)
      {
        vendorId: vendorMap["Riverdale Farm"],
        name: "Salad Mix (5oz bag)",
        description: "A blend of tender baby greens, arugula, and mustard leaves harvested the morning of market day.",
        price: "$5",
        reservationAllowed: false,
        status: "live",
      },
      {
        vendorId: vendorMap["Riverdale Farm"],
        name: "Mixed Fresh Herbs",
        description: "Seasonal bundle — basil, mint, and flat-leaf parsley. Changes weekly with the harvest.",
        price: "$4",
        reservationAllowed: false,
        status: "live",
      },
      {
        vendorId: vendorMap["Riverdale Farm"],
        name: "Summer Squash & Zucchini",
        description: "Heirloom varieties grown without pesticides. Great for grilling or roasting.",
        price: "$6",
        reservationAllowed: false,
        status: "live",
      },
      {
        vendorId: vendorMap["Riverdale Farm"],
        name: "Edible Flower Mix",
        description: "Nasturtiums, borage, and calendula. Grown organically, perfect for salads and garnishes.",
        price: "$7",
        reservationAllowed: false,
        status: "live",
      },
      {
        vendorId: vendorMap["Riverdale Farm"],
        name: "Seasonal Vegetable Box",
        description: "A curated weekly selection of whatever is at peak on the farm. A surprise every Thursday.",
        price: "$20",
        reservationAllowed: false,
        status: "live",
      },
      // Teresa's Farm (featured, no reservations)
      {
        vendorId: vendorMap["Teresa's Farm"],
        name: "Fresh Pasture Eggs (1 dozen)",
        description: "From heritage hens raised on open pasture. Multi-color eggs, rich yolks.",
        price: "$8",
        reservationAllowed: false,
        status: "live",
      },
      {
        vendorId: vendorMap["Teresa's Farm"],
        name: "Mixed Cut Flower Bouquet",
        description: "Seasonal blooms cut the morning of market day. Changes weekly.",
        price: "$14",
        reservationAllowed: false,
        status: "live",
      },
      {
        vendorId: vendorMap["Teresa's Farm"],
        name: "Summer Vegetable Box",
        description: "A curated mix of seasonal vegetables from the farm.",
        price: "$18",
        reservationAllowed: false,
        status: "live",
      },
    ])
    .returning();

  console.log(`Inserted ${products.length} products.`);
  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
