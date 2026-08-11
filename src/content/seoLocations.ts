export type CitySeoConfig = {
  slug: string;
  name: string;
  region: string;
  nearbyAreas: string[];
  highlights: string[];
  services: string[];
  vehicleTypes: string[];
};

export type ServiceSeoConfig = {
  slug: string;
  name: string;
  shortLabel: string;
  keywords: string[];
  trustPoints: string[];
  vehicleTypes: string[];
  serviceTypes: string[];
};

export const citySeoConfigs: CitySeoConfig[] = [
  {
    slug: 'coimbatore',
    name: 'Coimbatore',
    region: 'Tamil Nadu',
    nearbyAreas: ['Coimbatore City', 'Pollachi', 'Mettupalayam', 'Valparai', 'Sulur', 'Karumathampatti', 'Annur'],
    highlights: ['Industrial hub highway connections', 'Heavy commuter traffic', 'High demand for roadside assistance'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'Scooter', 'SUV', 'Truck', 'Auto']
  },
  {
    slug: 'chennai',
    name: 'Chennai',
    region: 'Tamil Nadu',
    nearbyAreas: ['Chennai City', 'Velachery', 'Tambaram', 'Anna Nagar', 'OMR', 'Adyar', 'Mylapore', 'T Nagar', 'Guindy', 'Chromepet'],
    highlights: ['Metro capital traffic density', 'Commuter and commercial transport lines', 'Instant roadside emergency support'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'Scooter', 'Van', 'SUV', 'Truck', 'Auto']
  },
  {
    slug: 'madurai',
    name: 'Madurai',
    region: 'Tamil Nadu',
    nearbyAreas: ['Madurai City', 'Melur', 'Thirumangalam', 'Usilampatti', 'Sholavandan', 'Anna Nagar', 'KK Nagar'],
    highlights: ['Southern transport corridor junction', 'Tourist and pilgrimage transit lines', '24/7 local highway mechanic network'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'SUV', 'Auto', 'Truck']
  },
  {
    slug: 'trichy',
    name: 'Tiruchirappalli',
    region: 'Tamil Nadu',
    nearbyAreas: ['Trichy City', 'Srirangam', 'Lalgudi', 'Manapparai', 'Thuraiyur', 'Musiri', 'Thillai Nagar'],
    highlights: ['Central geographic traffic corridor', 'National highways intersection support', 'Rapid highway mechanic response'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'Truck', 'Van', 'SUV', 'Auto']
  },
  {
    slug: 'salem',
    name: 'Salem',
    region: 'Tamil Nadu',
    nearbyAreas: ['Salem City', 'Attur', 'Mettur', 'Omalur', 'Sankari', 'Yercaud', 'Fairlands'],
    highlights: ['North-South highway connection lines', 'Heavy commercial truck corridor', 'Fast emergency recovery operations'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'Truck', 'SUV', 'Auto']
  },
  {
    slug: 'erode',
    name: 'Erode',
    region: 'Tamil Nadu',
    nearbyAreas: ['Erode City', 'Gobichettipalayam', 'Bhavani', 'Perundurai', 'Sathyamangalam', 'Surampatti'],
    highlights: ['Agricultural and textile transit routes', 'National and state highway movement', 'Trusted local mechanic listings'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'Scooter', 'Truck', 'SUV']
  },
  {
    slug: 'ariyalur',
    name: 'Ariyalur',
    region: 'Tamil Nadu',
    nearbyAreas: ['Ariyalur Town', 'Jayankondam', 'Sendurai', 'Andimadam'],
    highlights: ['Industrial cement logistics lines', 'Regional transport network support', 'Quick recovery response during breakdown'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'Truck', 'SUV', 'Auto']
  },
  {
    slug: 'chengalpattu',
    name: 'Chengalpattu',
    region: 'Tamil Nadu',
    nearbyAreas: ['Chengalpattu Town', 'Tambaram Suburbs', 'Mahabalipuram', 'Pallavaram', 'Chromepet', 'Vandalur'],
    highlights: ['Gateway to Chennai commuter traffic', 'High IT corridor vehicular volume', 'Crucial emergency roadside matching'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'Scooter', 'Van', 'SUV', 'Truck']
  },
  {
    slug: 'cuddalore',
    name: 'Cuddalore',
    region: 'Tamil Nadu',
    nearbyAreas: ['Cuddalore Town', 'Chidambaram', 'Neyveli', 'Panruti', 'Vriddhachalam'],
    highlights: ['Coastal industrial highway traffic', 'Major temple tourist corridors', 'Instant local breakdown support'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'Scooter', 'SUV', 'Truck', 'Auto']
  },
  {
    slug: 'dharmapuri',
    name: 'Dharmapuri',
    region: 'Tamil Nadu',
    nearbyAreas: ['Dharmapuri Town', 'Harur', 'Palacode', 'Pennagaram', 'Puppireddipatti'],
    highlights: ['NH-44 Bangalore-Salem connectivity', 'High commuter road traffic volume', 'Urgent breakdown recovery assistance'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'Truck', 'SUV', 'Auto']
  },
  {
    slug: 'dindigul',
    name: 'Dindigul',
    region: 'Tamil Nadu',
    nearbyAreas: ['Dindigul City', 'Palani', 'Kodaikanal', 'Oddanchatram', 'Vedasandur'],
    highlights: ['Hill station transit corridor support', 'National highway commerce routes', 'Reliable workshop visibility'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'SUV', 'Truck', 'Auto']
  },
  {
    slug: 'kallakurichi',
    name: 'Kallakurichi',
    region: 'Tamil Nadu',
    nearbyAreas: ['Kallakurichi Town', 'Ulundurpet', 'Sankarapuram', 'Chinnasalem'],
    highlights: ['Chennai-Salem NH connectivity point', 'Agricultural logistics traffic demand', 'Fast emergency breakdown lookup'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'Truck', 'SUV', 'Auto']
  },
  {
    slug: 'kancheepuram',
    name: 'Kanchipuram',
    region: 'Tamil Nadu',
    nearbyAreas: ['Kanchipuram Town', 'Sriperumbudur Industrial', 'Kundrathur', 'Walajabad'],
    highlights: ['Industrial manufacturing hub traffic', 'Chennai outer ring highway demand', 'Rapid response mechanical network'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'Scooter', 'SUV', 'Truck', 'Auto']
  },
  {
    slug: 'kanyakumari',
    name: 'Kanniyakumari',
    region: 'Tamil Nadu',
    nearbyAreas: ['Nagercoil City', 'Kanyakumari Town', 'Marthandam', 'Thuckalay', 'Colachel'],
    highlights: ['Southernmost tourist coastal routes', 'NH-66 Kanyakumari-Trivandrum movement', 'Essential roadside travel backup'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'Scooter', 'SUV', 'Auto']
  },
  {
    slug: 'karur',
    name: 'Karur',
    region: 'Tamil Nadu',
    nearbyAreas: ['Karur City', 'Kulithalai', 'Aravakurichi', 'Pallapatti'],
    highlights: ['Commercial industrial hub routes', 'NH-7 Central corridor travel volume', 'Fast towing and repair listings'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'Truck', 'SUV', 'Auto']
  },
  {
    slug: 'krishnagiri',
    name: 'Krishnagiri',
    region: 'Tamil Nadu',
    nearbyAreas: ['Krishnagiri Town', 'Hosur Industrial Hub', 'Denkanikottai', 'Uthangarai', 'Pochampalli'],
    highlights: ['Karnataka border transport lines', 'Heavy industrial logistics movement', 'High search intent for tow support'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'Truck', 'SUV', 'Auto']
  },
  {
    slug: 'mayiladuthurai',
    name: 'Mayiladuthurai',
    region: 'Tamil Nadu',
    nearbyAreas: ['Mayiladuthurai Town', 'Sirkazhi', 'Tarangambadi', 'Kuthalam'],
    highlights: ['Delta farming and heritage routes', 'Coastal highway transit zones', 'Trusted local mechanic directory'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'SUV', 'Auto', 'Van']
  },
  {
    slug: 'nagapattinam',
    name: 'Nagapattinam',
    region: 'Tamil Nadu',
    nearbyAreas: ['Nagapattinam Town', 'Vedaranyam', 'Kilvelur', 'Thirukkuvalai'],
    highlights: ['Coastal pilgrimage tourist traffic', 'Fishing harbor logisitcs lines', 'On-road recovery and repair support'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'SUV', 'Auto', 'Truck']
  },
  {
    slug: 'namakkal',
    name: 'Namakkal',
    region: 'Tamil Nadu',
    nearbyAreas: ['Namakkal City', 'Rasipuram', 'Tiruchengode', 'Komarapalayam', 'Velur'],
    highlights: ['Major trucking hub in Tamil Nadu', 'Poultry transit logistics routes', 'Professional heavy vehicle mechanic listings'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'Truck', 'SUV', 'Auto']
  },
  {
    slug: 'nilgiris',
    name: 'Nilgiris',
    region: 'Tamil Nadu',
    nearbyAreas: ['Udhagamandalam (Ooty)', 'Coonoor', 'Gudalur', 'Kotagiri', 'Wellington'],
    highlights: ['Hilly ghat road tourist travel', 'Steep terrain break assistance need', 'Specialized hill brake and engine mechanics'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'SUV', 'Van', 'Truck']
  },
  {
    slug: 'perambalur',
    name: 'Perambalur',
    region: 'Tamil Nadu',
    nearbyAreas: ['Perambalur Town', 'Veppanthattai', 'Kunnam', 'Alathur'],
    highlights: ['Chennai-Trichy NH-45 transport artery', 'Heavy traveler flow volume', 'Instant highway breakdown help'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'Truck', 'SUV', 'Auto']
  },
  {
    slug: 'pudukkottai',
    name: 'Pudukkottai',
    region: 'Tamil Nadu',
    nearbyAreas: ['Pudukkottai Town', 'Aranthangi', 'Iluppur', 'Alangudi', 'Gandarvakottai'],
    highlights: ['Heritage and agricultural trade lines', 'State highway traffic demand', 'Verified local garage discovery'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'SUV', 'Auto', 'Truck']
  },
  {
    slug: 'ramanathapuram',
    name: 'Ramanathapuram',
    region: 'Tamil Nadu',
    nearbyAreas: ['Ramanathapuram Town', 'Rameswaram Island', 'Paramakudi', 'Kamuthi', 'Mudukulathur'],
    highlights: ['Rameswaram tourist corridor route', 'Coastal highway travel safety support', 'Quick mechanic contact numbers'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'SUV', 'Auto', 'Truck']
  },
  {
    slug: 'ranipet',
    name: 'Ranipet',
    region: 'Tamil Nadu',
    nearbyAreas: ['Ranipet Town', 'Arakkonam', 'Walajapet', 'Arcot', 'Sholinghur'],
    highlights: ['Chennai-Bangalore industrial corridor', 'High automotive logistics activity', 'Rapid response on-road support'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'Truck', 'SUV', 'Auto']
  },
  {
    slug: 'sivaganga',
    name: 'Sivaganga',
    region: 'Tamil Nadu',
    nearbyAreas: ['Sivaganga Town', 'Karaikudi', 'Devakottai', 'Manamadurai', 'Tiruppuvanam'],
    highlights: ['Chettinad region tourism routes', 'Rural and urban mixed traffic', 'Prompt roadside assistance help'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'SUV', 'Auto', 'Truck']
  },
  {
    slug: 'tenkasi',
    name: 'Tenkasi',
    region: 'Tamil Nadu',
    nearbyAreas: ['Tenkasi Town', 'Courtallam Tourism', 'Sankarankovil', 'Kadayanallur', 'Puliyangudi'],
    highlights: ['Kerala border transit and tourist routes', 'Courtallam peak season commuter load', 'On-call local mechanic access'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'SUV', 'Auto', 'Truck']
  },
  {
    slug: 'thanjavur',
    name: 'Thanjavur',
    region: 'Tamil Nadu',
    nearbyAreas: ['Thanjavur City', 'Kumbakonam', 'Pattukkottai', 'Peravurani', 'Orathanadu'],
    highlights: ['Delta heritage tourist routes', 'Agriculture trade transportation flow', '24/7 breakdown helpline directory'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'SUV', 'Auto', 'Truck']
  },
  {
    slug: 'theni',
    name: 'Theni',
    region: 'Tamil Nadu',
    nearbyAreas: ['Theni City', 'Bodinayakanur', 'Periyakulam', 'Cumbum', 'Uthamapalayam'],
    highlights: ['Western Ghats hill station links', 'Agricultural trade logistics flow', 'Ghat road towing and repair backup'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'SUV', 'Van', 'Truck']
  },
  {
    slug: 'thiruvallur',
    name: 'Thiruvallur',
    region: 'Tamil Nadu',
    nearbyAreas: ['Thiruvallur Town', 'Avadi Suburbs', 'Ponneri', 'Poonamallee', 'Tiruttani'],
    highlights: ['Chennai border industrial logistics', 'High commuter traffic density', 'Immediate breakdown tow lookup'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'Scooter', 'SUV', 'Truck', 'Auto']
  },
  {
    slug: 'thiruvarur',
    name: 'Thiruvarur',
    region: 'Tamil Nadu',
    nearbyAreas: ['Thiruvarur Town', 'Mannargudi', 'Thiruthuraipoondi', 'Nannilam'],
    highlights: ['Core agricultural logistics routes', 'Pilgrim traffic movement', 'Local mechanic emergency numbers'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'SUV', 'Auto', 'Van']
  },
  {
    slug: 'thoothukudi',
    name: 'Thoothukudi',
    region: 'Tamil Nadu',
    nearbyAreas: ['Thoothukudi City', 'Kovilpatti', 'Tiruchendur', 'Kayalpattinam', 'Vilathikulam'],
    highlights: ['Port city logistics highways', 'Industrial logistics traffic corridors', '24/7 on-road flatbed and tyre services'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'Truck', 'SUV', 'Auto']
  },
  {
    slug: 'tirunelveli',
    name: 'Tirunelveli',
    region: 'Tamil Nadu',
    nearbyAreas: ['Tirunelveli City', 'Palayamkottai', 'Ambasamudram', 'Nanguneri', 'Valliyur'],
    highlights: ['Southern highway transport node', 'Commuter and commercial traffic volume', 'Fast emergency roadside assistance'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'SUV', 'Auto', 'Truck']
  },
  {
    slug: 'tirupattur',
    name: 'Tirupattur',
    region: 'Tamil Nadu',
    nearbyAreas: ['Tirupattur Town', 'Vaniyambadi', 'Ambur Leather Hub', 'Natrampalli'],
    highlights: ['NH-48 leather industrial highway route', 'Heavy truck and bus movement', '24/7 tyre and mechanical breakdown service'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'Truck', 'SUV', 'Auto']
  },
  {
    slug: 'tiruppur',
    name: 'Tiruppur',
    region: 'Tamil Nadu',
    nearbyAreas: ['Tiruppur City', 'Dharapuram', 'Udumalaipettai', 'Palladam', 'Kangeyam', 'Avinashi'],
    highlights: ['Major textile industrial cargo traffic', 'High density highway networks', 'Urgent response repair services'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'Scooter', 'Truck', 'SUV', 'Auto']
  },
  {
    slug: 'tiruvannamalai',
    name: 'Tiruvannamalai',
    region: 'Tamil Nadu',
    nearbyAreas: ['Tiruvannamalai Town', 'Arani Silk Hub', 'Cheyyar', 'Polur', 'Vandavasi'],
    highlights: ['Pilgrimage tourist transit demand', 'State highway junction network', '24/7 on-call breakdown assistance'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'SUV', 'Auto', 'Truck']
  },
  {
    slug: 'vellore',
    name: 'Vellore',
    region: 'Tamil Nadu',
    nearbyAreas: ['Vellore City', 'Gudiyatham', 'Katpadi', 'Pernambut', 'Anaicut'],
    highlights: ['NH-48 Chennai-Bangalore key corridor', 'High educational & hospital visitor traffic', 'Trusted workshop directory'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'Truck', 'SUV', 'Auto']
  },
  {
    slug: 'viluppuram',
    name: 'Viluppuram',
    region: 'Tamil Nadu',
    nearbyAreas: ['Viluppuram Town', 'Tindivanam', 'Gingee Fort', 'Vikravandi', 'Marakkanam'],
    highlights: ['NH-45 South travel gateway corridor', 'Heavy commercial traffic volume', 'Instant highway flatbed tow services'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'Truck', 'SUV', 'Auto']
  },
  {
    slug: 'virudhunagar',
    name: 'Virudhunagar',
    region: 'Tamil Nadu',
    nearbyAreas: ['Virudhunagar Town', 'Sivakasi Industry', 'Rajapalayam', 'Aruppukottai', 'Sattur', 'Srivilliputhur'],
    highlights: ['Industrial fireworks logistics corridor', 'Southern NH-44 heavy transport artery', '24/7 mobile workshop response'],
    services: ['24/7 Mobile Puncture Repair', 'Emergency Towing & Flatbed Services', 'Car Battery Jump Start & Replacement', 'On-Site Engine Diagnostics & Tuning', 'Brake Overhaul & Pad Replacement', 'Bike/Scooter On-Road Assistance', 'Heavy Vehicle Towing & Recovery', 'AC Gas Refill & Coolant Leak Fix'],
    vehicleTypes: ['Car', 'Bike', 'Truck', 'SUV', 'Auto']
  }
];

export const serviceSeoConfigs: ServiceSeoConfig[] = [
  {
    slug: 'car-mechanic',
    name: 'Car Mechanic',
    shortLabel: 'car mechanic',
    keywords: ['car mechanic near me', 'car service shop', 'car breakdown help'],
    trustPoints: ['Car-focused repair support', 'Nearby workshop discovery', 'Fast search-to-contact flow'],
    vehicleTypes: ['Car', 'SUV', 'Van'],
    serviceTypes: []
  },
  {
    slug: 'bike-mechanic',
    name: 'Bike Mechanic',
    shortLabel: 'bike mechanic',
    keywords: ['bike mechanic near me', 'two wheeler repair', 'motorcycle roadside help'],
    trustPoints: ['Bike and scooter repair visibility', 'Two-wheeler roadside support', 'Local shop discovery'],
    vehicleTypes: ['Bike', 'Scooter'],
    serviceTypes: []
  },
  {
    slug: 'towing',
    name: 'Towing Service',
    shortLabel: 'towing service',
    keywords: ['towing near me', 'vehicle towing', 'breakdown towing support'],
    trustPoints: ['Breakdown recovery support', 'Emergency tow discovery', 'Useful during non-drivable breakdowns'],
    vehicleTypes: [],
    serviceTypes: ['Emergency Towing & Flatbed Services', 'Heavy Vehicle Towing & Recovery']
  }
];

export const citySeoMap = Object.fromEntries(citySeoConfigs.map((city) => [city.slug, city]));
export const serviceSeoMap = Object.fromEntries(serviceSeoConfigs.map((service) => [service.slug, service]));
