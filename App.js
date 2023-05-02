import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from "react-native";
import axios from "axios";
import { FontAwesome } from "@expo/vector-icons";
import { SearchBar } from "react-native-elements";

const API_URL = "https://itunes.apple.com/search";

export default function App() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [favModalVisible, setFavModalVisible] = useState(false);
  const [rating, setRating] = useState("");

  const handleSearch = (text) => {
    setSearch(text); // Mettre à jour la valeur de recherche lors de la saisie
  };

  useEffect(() => {
    const params = {
      term: search,
      media: "music",
      limit: 20,
    };

    const fetchData = async () => {
      setLoading(true); // Activer le chargement
      try {
        const response = await axios.get(API_URL, { params }); // Effectuer une requête avec les paramètres de recherche
        setResults(response.data.results); // Mettre à jour les résultats de recherche
        setLoading(false); // Désactiver le chargement
      } catch (error) {
        console.log(error.message);
        throw error;
      }
    };

    if (search !== "") {
      fetchData();
    }
  }, [search]);

  const select = (result) => {
    setSelectedResult(result); // Mettre à jour le résultat sélectionné
    setItemModalVisible(true); // Afficher la modal
  };

  const removeFromFavorites = (trackId) => {
    // Filtrer les favoris pour supprimer l'élément avec l'ID donné
    const updatedFavorites = favorites.filter(
      (item) => item.trackId !== trackId
    );
    setFavorites(updatedFavorites); // Mettre à jour les favoris
  };

  const addToFavorites = () => {
    // Vérifier si le résultat sélectionné est déjà un favori
    const isAlreadyFavorite = favorites.some(
      (item) => item.trackId === selectedResult.trackId
    );

    // Supprimer de la liste des favoris
    if (isAlreadyFavorite) {
      const updatedFavorites = favorites.filter(
        (item) => item.trackId !== selectedResult.trackId
      );
      setFavorites(updatedFavorites); // Mettre à jour les favoris
    } else {
      const favoris = { ...selectedResult, rating: rating }; // Ajouter le résultat sélectionné aux favoris avec le champs note en plus
      setFavorites([...favorites, favoris]); // Mettre à jour les favoris
    }

    setSelectedResult(null);
    setRating("");
  };

  const check = (obj2) => {
    return favorites.some((obj1) => obj1.trackId == obj2.trackId); // Vérifier si l'objet est déjà présent
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>🎸 Music App 🎸</Text>
        <FontAwesome
          style={styles.favoritesButton}
          name="star"
          size={25}
          color="#feca57"
          onPress={() => setFavModalVisible(true)}
        />
      </View>
      <View style={styles.body}>
        {selectedResult && (
          <Modal
            animationType="slide"
            visible={itemModalVisible}
            onRequestClose={() => setItemModalVisible(false)}
            transparent={true}>
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <View style={styles.modalButtons}>
                  <FontAwesome
                    name="close"
                    size={25}
                    color="black"
                    onPress={() => {
                      setSelectedResult(null);
                      setItemModalVisible(false);
                    }}
                  />
                </View>
                <Image
                  style={{ height: 100, width: 100 }}
                  source={{ uri: selectedResult.artworkUrl100 }}
                />
                <Text style={styles.modalTitle}>
                  {selectedResult.trackName}
                </Text>
                <View style={styles.modalRow}>
                  <Text>🎤</Text>
                  <Text style={styles.modalText}>
                    {selectedResult.artistName}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text>💿</Text>
                  <Text style={styles.modalText}>
                    {selectedResult.collectionName}
                  </Text>
                </View>

                <View style={styles.modalRow}>
                  <Text>🕛</Text>
                  <Text style={styles.modalText}>
                    {Math.round(selectedResult.trackTimeMillis / 60000)} min
                  </Text>
                </View>

                {!check(selectedResult) && (
                  <TextInput
                    style={styles.ratingInput}
                    placeholder="Ajouter une note (/10)"
                    value={rating}
                    onChangeText={(text) => setRating(text)}
                    keyboardType="numeric"
                  />
                )}
                <FontAwesome
                  name={check(selectedResult) ? "star" : "star-o"}
                  size={25}
                  color="#feca57"
                  onPress={addToFavorites}
                />
              </View>
            </View>
          </Modal>
        )}
        {favorites && (
          <Modal
            animationType="slide"
            visible={favModalVisible}
            onRequestClose={() => setFavModalVisible(false)}
            transparent={true}>
            <View style={styles.modalContainer}>
              <View style={styles.modalButtons}>
                <FontAwesome
                  name="close"
                  size={25}
                  color="black"
                  onPress={() => {
                    setFavModalVisible(false);
                  }}
                />
              </View>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>💛 Mes favoris 💛</Text>
              </View>
              {favorites.length > 0 ? (
                favorites.map((item) => (
                  <View style={styles.modalRow} key={item.trackId}>
                    <Image
                      style={{ height: 50, width: 50 }}
                      source={{ uri: item.artworkUrl100 }}
                    />
                    <Text numberOfLines={1} style={styles.favoritesModalTitle}>
                      {item.trackName}
                    </Text>
                    {item.rating && (
                      <Text style={styles.modalSubtitle}>
                        ({item.rating} /10)
                      </Text>
                    )}
                    <Text
                      style={{ padding: 5 }}
                      onPress={() => removeFromFavorites(item.trackId)}>
                      ❌
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noFavoritesText}>Favoris vide 😕</Text>
              )}
            </View>
          </Modal>
        )}
        <SearchBar
          placeholder="Recherche"
          onChangeText={handleSearch}
          value={search}
          round={true}
          containerStyle={styles.containerStyle}
          inputContainerStyle={styles.searchContainer}
          inputStyle={styles.searchInput}
          onClear={handleSearch}
        />
        <ActivityIndicator animating={loading} />
        {results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.trackId.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultContainer}
                onPress={() => select(item)}>
                <View style={{ margin: 10 }}>
                  <Image
                    style={{ height: 50, width: 50 }}
                    source={{ uri: item.artworkUrl100 }}
                  />
                </View>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultTitle}>{item.trackName}</Text>
                  <Text style={styles.resultSubtitle}>{item.artistName}</Text>
                </View>
                <FontAwesome name="chevron-right" size={18} color="black" />
              </TouchableOpacity>
            )}
          />
        ) : (
          <Text style={styles.noFavoritesText}>
            Essayez de rechercher un artiste ou une musique 🎧
          </Text>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 20 : 0,
    height: Platform.OS === "ios" ? 100 : 70,
    backgroundColor: "#5f27cd",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  favoritesButton: {
    position: "absolute",
    right: 20,
    top: 55,
  },
  headerText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: Platform.OS === "ios" ? 20 : 0,
  },
  body: {
    flex: 1,
    padding: 20,
    width: "100%",
  },
  containerStyle: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  searchContainer: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderBottomWidth: 1,
  },
  searchInput: {
    width: "100%",
    fontSize: 16,
  },
  resultContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  resultSubtitle: {
    color: "#999",
    fontSize: 14,
  },
  modalBackground: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    height: "100%",
  },
  modalContainer: {
    marginVertical: "50%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  favoritesModalTitle: {
    marginLeft: 10,
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
  },
  modalTitle: {
    marginBottom: 15,
    fontSize: 18,
    fontWeight: "bold",
  },
  modalTitleContainer: {
    marginBottom: 50,
    borderBottomColor: "lightgrey",
    borderBottomWidth: 1,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    marginLeft: 5,
    marginRight: 20,
    flex: 2,
  },
  modalRow: {
    width: "100%",
    justifyContent: "space-between",
    flexWrap: "wrap",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  modalButtons: {
    position: "absolute",
    top: 5,
    right: 5,
  },
  ratingInput: {
    height: 40,
    width: "50%",
    borderColor: "lightgray",
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 20,
    padding: 10,
    borderRadius: 15,
  },
  noFavoritesText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});
