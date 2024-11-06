const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/calculate-hauling', (req, res) => {
    const { soilVolume, bulkingFactor, truckCapacity, cycleDuration, finishDuration, workingHoursPerDay } = req.body;

    const totalVolume = soilVolume * (1+bulkingFactor);
	const total_1truck_hours = finishDuration*workingHoursPerDay;
	const haulage_rate_hour = totalVolume/total_1truck_hours;
	const volumn_1truck_hour = truckCapacity/(cycleDuration/60);
	const Truck_number = haulage_rate_hour/volumn_1truck_hour;

    res.json({
        
        totalVolume: totalVolume.toFixed(2),
        total_1truck_hours:  total_1truck_hours.toFixed(2),
		haulage_rate_hour: haulage_rate_hour.toFixed(2),
		volumn_1truck_hour: volumn_1truck_hour.toFixed(2),
		Truck_number: Math.ceil(Truck_number),		
    });
});

app.post('/calculate-borrowed-soil', (req, res) => {
    const { requiredCompaction, compactedVolume, borrowSoilDensity, labMaxDensity } = req.body;

    // Calculation for the total volume of borrowed soil
	
	const relative_compaction = 100*borrowSoilDensity/labMaxDensity;
	const total_volume_borrowedsoil = compactedVolume*requiredCompaction/relative_compaction;
    

    res.json({ 
		relative_compaction: relative_compaction.toFixed(2), 
		total_volume_borrowedsoil: total_volume_borrowedsoil.toFixed(2),
		});
});

app.post('/calculate-tension', (req, res) => {
    const { objectWeight, numberOfCables, slingAngle } = req.body;

    // Calculate the factor of contribution based on the given equation
    const x = slingAngle;
    const y = 39.195 * Math.pow(x, -0.852)
    // Calculate the tension force in one cable
    const tensionForce = (objectWeight) / numberOfCables * y;

    res.json({
        tensionForce: tensionForce.toFixed(2),
		y: y.toFixed(2),
    });
});

app.post('/calculate-production-rate', (req, res) => {
    const { achieveQty, cycleTime, workingHours } = req.body;

    // Calculate the daily standard production rate
    const productionRate = (achieveQty / cycleTime) * workingHours * 60;

    res.json({
        productionRate: productionRate.toFixed(2)
    });
});


app.post('/calculate-productivity', (req, res) => {
    const { truckCapacity, Excavator_bucket_volume, loadTime, travelDistance, truckSpeed, dumpTime, workingHours, swellFactor } = req.body;

    // Calculate the daily standard production rate
    const swellFactorDecimal = swellFactor / 100;
    const maximum_excavator_daily_productivity = Excavator_bucket_volume * workingHours * 3600 / loadTime * (1+swellFactorDecimal);
    const Travel_time_cycle = 2 * travelDistance * 3600 / truckSpeed;
    const loading_time_1truck = loadTime * truckCapacity / Excavator_bucket_volume;
    const total_time_1_cycle = Travel_time_cycle + loading_time_1truck + dumpTime;
    const maximum_dumptruck_daily_productivity = truckCapacity * workingHours * 3600 / total_time_1_cycle;
    const number_required_truck = Math.ceil(maximum_excavator_daily_productivity / maximum_dumptruck_daily_productivity);

    res.json({
        swellFactorDecimal: swellFactorDecimal.toFixed(2),
        maximum_excavator_daily_productivity: maximum_excavator_daily_productivity.toFixed(2),
        Travel_time_cycle: Travel_time_cycle.toFixed(2),
        loading_time_1truck: loading_time_1truck.toFixed(2),
        total_time_1_cycle: total_time_1_cycle.toFixed(2),
        maximum_dumptruck_daily_productivity: maximum_dumptruck_daily_productivity.toFixed(2),
        number_required_truck: number_required_truck.toFixed(2)
    });
});

app.post('/calculate-rebar-weight', (req, res) => {
    const rebarData = req.body;

    const results = rebarData.map(item => {
        const weightPerMeter = (Math.PI * Math.pow(item.diameter / 2, 2) * 7850) / 1000000; // kg/m
        const totalWeight = weightPerMeter * item.length * item.number;
        return { weightPerMeter, totalWeight };
    });

    res.json(results);
});

app.post('/calculate-pile-capacity', (req, res) => {
    const { weightOfHammer, heightOfDrop, penetration, rebound, weight_pile_n_accessory, coefficient_restitution } = req.body;

    // Hiley formula: R = Whη/(S + C/2)
    const S = penetration;
    const C = rebound;
    const w = weightOfHammer;
    const h = heightOfDrop;
    const P = weight_pile_n_accessory;
    const e = coefficient_restitution;
    let n;
    let ultimateDrivingResistance;

    if (w > P * e) {
        n = (w + P * e * e) / (w + P);
        ultimateDrivingResistance = (w * h * n) / (S + (C / 2));
    } else {
        n = (w + P * e * e) / (w + P) - ((w - P * e) / (w + P)) * ((w - P * e) / (w + P));
        ultimateDrivingResistance = (w * h * n) / (S + (C / 2));
    }

    res.json({
        n: n.toFixed(2),
		ultimateDrivingResistance: ultimateDrivingResistance.toFixed(2)
    });
});



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
