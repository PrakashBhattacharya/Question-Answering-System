# 🧠 Question Answering System

> A full-stack AI-powered Extractive Question Answering system using **BERT**, **SQuAD 2.0**, **PyTorch**, **Transformers**, **FastAPI**, and **React**.

[![Python](https://img.shields.io/badge/Python-3.x-blue?logo=python)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-ML-orange?logo=pytorch)](https://pytorch.org/)
[![Transformers](https://img.shields.io/badge/HuggingFace-Transformers-yellow?logo=huggingface)](https://huggingface.co/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react)](https://react.dev/)
[![Dataset](https://img.shields.io/badge/Dataset-SQuAD%202.0-purple)](https://rajpurkar.github.io/SQuAD-explorer/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Overview

The **Question Answering System** is a machine-learning-based web application designed to extract precise answers from a user-provided context.

The system accepts:

- 📄 A context passage
- ❓ A natural-language question

It then uses a **fine-tuned BERT extractive QA model** to identify the most relevant answer span from the supplied context.

If the context does not contain an answer, the system can explicitly return:

> **No Answer Found**

This prevents the system from inventing information that is not supported by the provided context.

---

## ✨ Key Features

### 🤖 AI-Powered Question Answering
- Fine-tuned BERT model for extractive question answering
- Context-aware answer extraction
- Start/end token prediction

### 📚 SQuAD 2.0 Support
- SQuAD 2.0 dataset preprocessing
- Training and evaluation support
- Handles both answerable and unanswerable questions

### 🔍 Answer Evidence
- Extracted answer displayed prominently
- Relevant answer span highlighted inside the original context
- Answer score/confidence information where available

### 🌐 Full-Stack Web Application
- Modern React frontend
- FastAPI inference backend
- REST-based frontend/backend communication
- Loading, validation, success, and error states

### 📊 Model Evaluation
- Exact Match (EM)
- F1 Score
- Answerable vs. unanswerable analysis
- Error analysis for incorrect spans and boundary errors

---
