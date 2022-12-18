// const pipeline = [
//     {
//         $match: {
//             $or: [{followings: id}, {followers: id}]
//         }
//     },
//     {
//         $project: {
//             followings: 1,
//             followers: 1
//         }
//     },
//     {
//         $unwind: {
//             path: "$followings",
//             preserveNullAndEmptyArrays: true
//         }
//     },
//     {
//         $unwind: {
//             path: "$followers",
//             preserveNullAndEmptyArrays: true
//         }
//     },
//     {
//         $match: {
//             $or: [{followings: id}, {followers: id}]
//         }
//     },
//     {
//         $group: {
//             _id: "$_id",
//             followings: { $addToSet: "$followings" },
//             followers: { $addToSet: "$followers" }
//         }
//     },
//     {
//         $addFields: {
//             followings: { $setDifference: ["$followings", [id]] },
//             followers: { $setDifference: ["$followers", [id]] }
//         }
//     },
//     {
//         $project: {
//             _id: 0,
//             userId: "$_id",
//             followings: 1,
//             followers: 1
//         }
//     }
// ];
// etapes:
// 1. $match : filtre les documents qui ont id dans leurs champs followings ou followers
// 2. $project : ne conserve que les champs followings et followers.
// 3. $unwind : décompose les champs followings et followers en documents distincts, en préservant les valeurs nulles et vides.
// 4. $match : filtre de nouveau les documents qui ont id dans leurs champs followings ou followers.
// 5. $group : regroupe les documents par leur identifiant (_id), et crée des tableaux distincts pour les champs followings et followers.
// 6. $addFields : utilise l'opérateur $setDifference pour enlever id de ces tableaux.
// 7. $project : ne conserve que les champs _id (renommé en userId), followings et followers.

// "$addFields" est une étape de traitement de données dans l'agrégateur de pipelines MongoDB,
// qui permet de créer de nouveaux champs ou de remplacer des valeurs de champs existants avec de nouvelles valeurs.
// Cette étape peut être utilisée pour ajouter de nouvelles informations à un document ou pour transformer des données existantes d'une manière spécifique.

// L'opérateur "$setDifference" permet de retirer les éléments d'un tableau qui sont présents dans un autre tableau.
// Cet opérateur est utile lorsque vous voulez retirer un ensemble d'éléments spécifiques d'un tableau.
// Par exemple, si vous voulez retirer les éléments "a", "b" et "c" d'un tableau, vous pouvez utiliser l'opérateur "$setDifference" de cette manière :
// {
//    $setDifference: [ "$array", [ "a", "b", "c" ] ]
// }