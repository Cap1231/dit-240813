export class ModalManager {
    constructor() {
        // アクション選択モーダル
        this.actionSelectionModal = document.getElementById('action-selection-modal');
        this.actionSelectionCancelBtn = this.actionSelectionModal.querySelector('.cancel-btn');
        this.actionSelectionNextBtn = this.actionSelectionModal.querySelector('.next-btn');
        // 部位番号登録モーダル
        this.partNumberModal = document.getElementById('part-number-modal');
        this.partNumberCancelBtn = this.partNumberModal.querySelector('.cancel-btn');
        this.partNumberRegisterBtn = this.partNumberModal.querySelector('.register-btn');
        this.partNumberInput = this.partNumberModal.querySelector('#part-number-input');
        // 遷移画面登録モーダル
        this.transitionScreenModal = document.getElementById('transition-screen-modal');
        this.transitionScreenCancelBtn = this.transitionScreenModal.querySelector('.cancel-btn');
        this.transitionScreenRegisterBtn = this.transitionScreenModal.querySelector('.register-btn');
        this.transitionScreenInput = this.transitionScreenModal.querySelector('#transition-screen-input');

        this.modals = document.querySelectorAll('.modal');
        this.rect = null; // 選択されている矩形の相対座標

        this.setupEventListeners();
    }

    setupEventListeners() {
        // アクション選択モーダル
        this.actionSelectionCancelBtn.addEventListener('click', () => this.closeModal(this.actionSelectionModal));
        this.actionSelectionNextBtn.addEventListener('click', () => this.handleNext());
        document.querySelectorAll('input[name="selection-type"]').forEach(input => {
            input.addEventListener('change', () => {
                if (document.querySelector('input[name="selection-type"]:checked')) {
                    this.actionSelectionNextBtn.disabled = false; // 選択されたら「次へ」ボタンを有効化
                }
            });
        });
        // 部位番号登録モーダル
        this.partNumberCancelBtn.addEventListener('click', () => this.closeModal(this.partNumberModal));
        this.partNumberRegisterBtn.addEventListener('click', () => this.registerPartNumber());
        this.partNumberInput.addEventListener('input', () => {
            if (this.partNumberInput.value.trim() !== '') {
                this.partNumberRegisterBtn.disabled = false;
            }
        });
        // 遷移画面登録モーダル
        this.transitionScreenCancelBtn.addEventListener('click', () => this.closeModal(this.transitionScreenModal));
        this.transitionScreenRegisterBtn.addEventListener('click', () => this.registerTransitionScreen());
        this.transitionScreenInput.addEventListener('input', () => {
            if (this.transitionScreenInput.value.trim() !== '') {
                this.transitionScreenRegisterBtn.disabled = false;
            }
        });
    }

    // TODO: 名前要検討。Main的な役割。ActionSelectionModal.execute ?
    openActionSelectionModal(rect) {
        this.rect = rect;
        this.openModal(this.actionSelectionModal)
    }

    openModal(targetModal) {
        this.modals.forEach(modal => {
            if (modal === targetModal) {
                modal.style.display = 'block';
                modal.classList.remove('inactive');
            } else {
                modal.classList.add('inactive');
            }
        });
    }

    closeModal(targetModal) {
        targetModal.style.display = 'none';
        this.modals.forEach(modal => modal.classList.remove('inactive'));
    }

    //
    // アクション選択モーダル
    //
    handleNext() {
        const selectionType= document.querySelector('input[name="selection-type"]:checked').value;
        if (selectionType === 'part-number') {
            // 部位番号登録モーダルを開く
            this.openPartNumberModal();
        } else if (selectionType === 'transition-screen') {
            // 遷移画面登録モーダルを開く
            this.openTransitionScreenModal();
        }
    }

    openPartNumberModal() {
        this.openModal(this.partNumberModal)
    }

    openTransitionScreenModal() {
        this.openModal(this.transitionScreenModal)
    }

    //
    // 部位番号登録モーダル
    //
    registerPartNumber() {
        try {
            console.log('選択している矩形の相対座標:', this.rect);
            // TODO: API 叩く
            this.partNumberInput.value = '';
            this.closeModal(this.partNumberModal)
            // TODO: 矩形の枠の色を変える
        } catch (e) {
            alert('部位番号の登録失敗')
        }
    }

    //
    // 遷移画面登録モーダル
    //
    registerTransitionScreen() {
        try {
            console.log('選択している矩形の相対座標:', this.rect);
            // TODO: API 叩く
            this.transitionScreenInput.value = ''
            this.closeModal(this.transitionScreenModal)
            // TODO: 矩形の枠の色を変える
        } catch (e) {
            alert('遷移画面の登録失敗')
        }
    }
}
