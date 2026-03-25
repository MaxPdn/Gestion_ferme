import Campaign from "../models/Campaign.model.js";

export const createCampaign = async (data) => {
  return await Campaign.create(data);
};

export const getAllCampaigns = async () => {
  return await Campaign.find()
    .populate("department", "name") // 🔥 clé
    .sort({ createdAt: -1 });
};

export const getCampaignById = async (id) => {
  return await Campaign.findById(id).populate("department", "name");
};

export const updateCampaign = async (id, data) => {
  return await Campaign.findByIdAndUpdate(id, data, { new: true });
};

export const deleteCampaign = async (id) => {
  return await Campaign.findByIdAndDelete(id);
};

// --- AJOUT DE PERTES ---
export const addLosses = async (id, quantity) => {
  const campaign = await Campaign.findById(id);
  if (!campaign) throw new Error("Campagne introuvable");

  // 🔥 SÉCURITÉ : On ne peut pas perdre plus que ce qu'on a
  if (quantity > campaign.currentCount) {
    throw new Error(
      `Action impossible : Il ne reste que ${campaign.currentCount} animaux.`,
    );
  }

  campaign.losses += quantity;
  campaign.currentCount -= quantity;

  // Historique pour tes graphiques
  campaign.lossHistory.push({ quantity, date: new Date() });

  await campaign.save();
  return campaign;
};

// --- AJOUT DE VENTES ---
export const addSales = async (id, quantity) => {
  const campaign = await Campaign.findById(id);
  if (!campaign) throw new Error("Campagne introuvable");

  // 🔥 NOUVELLE SÉCURITÉ : Vérification du statut
  if (campaign.status !== "active") {
    throw new Error(
      `Vente impossible : La campagne est actuellement '${campaign.status}'. Elle doit être 'En cours'.`,
    );
  }

  // 🔥 SÉCURITÉ : On ne peut pas vendre plus que le stock actuel
  if (quantity > campaign.currentCount) {
    throw new Error(
      `Vente impossible : Stock insuffisant (${campaign.currentCount} restants).`,
    );
  }

  campaign.sold += quantity;
  campaign.currentCount -= quantity;

  await campaign.save();
  return campaign;
};

export const changeStatus = async (id, status) => {
  return await Campaign.findByIdAndUpdate(id, { status }, { new: true });
};

export const getDashboardStats = async (req, res) => {
  try {
    const campaigns = await Campaign.find();

    if (!campaigns || campaigns.length === 0) {
      return res.json({
        stats: [
          {
            label: "Effectif",
            value: "0",
            trend: "0%",
            trendColor: "text-slate-400 bg-slate-100",
          },
          {
            label: "Pertes (24h)",
            value: "0",
            trend: "0%",
            trendColor: "text-slate-400 bg-slate-100",
          },
          {
            label: "Mortalité",
            value: "0%",
            trend: "Stable",
            trendColor: "text-blue-500 bg-blue-500",
          },
          {
            label: "Bâtiments",
            value: "0",
            trend: "Inactif",
            trendColor: "text-slate-400 bg-slate-100",
          },
        ],
        chartData: [0, 0, 0, 0, 0, 0, 0],
        topAlerts: [],
      });
    }

    // --- 1. Gestion des dates ---
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    // --- 2. Calcul des Pertes (Aujourd'hui vs Hier) ---
    const getLossesForPeriod = (start, end = new Date()) => {
      return campaigns.reduce((acc, c) => {
        const periodLosses = (c.lossHistory || [])
          .filter((l) => new Date(l.date) >= start && new Date(l.date) < end)
          .reduce((sum, l) => sum + l.quantity, 0);
        return acc + periodLosses;
      }, 0);
    };

    const lossesToday = getLossesForPeriod(todayStart);
    const lossesYesterday = getLossesForPeriod(yesterdayStart, todayStart);

    // Calcul de la tendance des pertes
    let lossTrend = "0%";
    let lossTrendColor = "text-slate-400 bg-slate-100";
    if (lossesYesterday > 0) {
      const diff = ((lossesToday - lossesYesterday) / lossesYesterday) * 100;
      lossTrend = `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`;
      lossTrendColor =
        diff > 0
          ? "text-red-500 bg-red-500"
          : "text-emerald-500 bg-emerald-500";
    }

    // --- 3. Données du graphique (7 derniers jours) ---
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - i);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);
      chartData.push(getLossesForPeriod(d, nextD));
    }

    // --- 4. Autres Stats ---
    const totalEffectif = campaigns.reduce(
      (acc, c) => acc + (c.currentCount || 0),
      0,
    );
    const avgMortality = (
      campaigns.reduce((acc, c) => {
        return (
          acc + (c.initialCount > 0 ? (c.losses / c.initialCount) * 100 : 0)
        );
      }, 0) / campaigns.length
    ).toFixed(2);

    // --- 5. Alertes ---
    const topAlerts = campaigns
      .map((c) => ({
        id: c._id,
        building: c.name,
        rate:
          c.initialCount > 0
            ? ((c.losses / c.initialCount) * 100).toFixed(1)
            : 0,
      }))
      .filter((c) => c.rate >= 5)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 3);

    // --- 6. Envoi de la réponse unique ---
    res.json({
      stats: [
        {
          label: "Effectif",
          value: totalEffectif.toLocaleString(),
          trend: "Stable",
          trendColor: "text-blue-500 bg-blue-500",
        },
        {
          label: "Pertes (24h)",
          value: lossesToday,
          trend: lossTrend,
          trendColor: lossTrendColor,
        },
        {
          label: "Mortalité",
          value: `${avgMortality}%`,
          trend: "Global",
          trendColor: "text-slate-400 bg-slate-100",
        },
        {
          label: "Bâtiments",
          value: campaigns.length,
          trend: "Actifs",
          trendColor: "text-orange-500 bg-orange-500",
        },
      ],
      chartData,
      topAlerts,
    });
  } catch (error) {
    console.error("🔥 Erreur Backend Stats:", error);
    res.status(500).json({ message: "Erreur lors du calcul des statistiques" });
  }
};
