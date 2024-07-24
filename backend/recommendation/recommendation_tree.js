class RecommendationTree {
  constructor(points) {
    if (!Array.isArray(points)) {
      throw new Error("Points array is invalid");
    }
    if (points.length === 0) {
      throw new Error("Points array is empty");
    }
    this.root = this.buildTree(points, 0);
  }

  buildTree(points, depth) {
    if (points.length === 0) return null;
    const axis = depth % points[0].vector.length;
    points.sort((a, b) => a.vector[axis] - b.vector[axis]);
    const median = Math.floor(points.length / 2);
    return {
      point: points[median],
      left: this.buildTree(points.slice(0, median), depth + 1),
      right: this.buildTree(points.slice(median + 1), depth + 1),
    };
  }

  findNearestNeighbours(targetVector, k) {
    if (!this.root) {
      throw new Error("tree is empty");
    }
    const nearest = [];
    this.searchNearest(this.root, targetVector, 0, nearest, k);
    return nearest;
  }

  searchNearest(node, targetVector, depth, nearest, k) {
    if (!node) return;
    const axis = depth % targetVector.length;
    const distance = this.calculateDistance(targetVector, node.point.vector);
    if (nearest.length < k) {
      nearest.push({ ...node.point, distance });
      nearest.sort((a, b) => a.distance - b.distance);
    } else if (distance < nearest[nearest.length - 1].distance) {
      nearest[nearest.length - 1] = {
        ...node.point,
        distance,
      };
      nearest.sort((a, b) => a.distance - b.distance);
    }
    const nextBranch =
      targetVector[axis] < node.point.vector[axis] ? node.left : node.right;
    const otherBranch =
      targetVector[axis] < node.point.vector[axis] ? node.right : node.left;

    this.searchNearest(nextBranch, targetVector, depth + 1, nearest, k);
    if (
      nearest.length < k ||
      Math.abs(targetVector[axis] - node.point.vector[axis]) <
        nearest[nearest.length - 1].distance
    ) {
      this.searchNearest(otherBranch, targetVector, depth + 1, nearest, k);
    }
  }

  calculateDistance(firstVector, secondVector) {
    return Math.sqrt(
      firstVector.reduce(
        (sum, value, index) => sum + (value - secondVector[index]) ** 2,
        0
      )
    );
  }
}

module.exports = RecommendationTree;
