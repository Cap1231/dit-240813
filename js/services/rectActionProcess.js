// アクション選択 -> 部位番号登録
// アクション選択 -> 遷移先画像登録
export class RectActionProcess {
    constructor() {
        this.modals = document.querySelectorAll('.modal')
        // アクション選択
        this.actionSelectionModal = document.getElementById('action-selection-modal')
        this.actionSelectionCancelBtn = this.actionSelectionModal.querySelector('.cancel-btn')
        this.actionSelectionNextBtn = this.actionSelectionModal.querySelector('.next-btn')
        // 部位番号登録
        this.partNumberModal = document.getElementById('part-number-modal')
        this.partNumberCancelBtn = this.partNumberModal.querySelector('.cancel-btn')
        this.partNumberRegisterBtn = this.partNumberModal.querySelector('.register-btn')
        this.partNumberInput = this.partNumberModal.querySelector('#part-number-input')
        // 遷移先画像登録
        this.transitionImageModal = document.getElementById('transition-image-modal')
        this.transitionImageCancelBtn = this.transitionImageModal.querySelector('.cancel-btn')
        this.transitionImageRegisterBtn = this.transitionImageModal.querySelector('.register-btn')
        this.transitionImageInput = this.transitionImageModal.querySelector('#transition-image-input')

        this.rect = null // 選択している矩形の相対座標と登録ステータスを管理するステート

        this.onRegistrationSuccess = null // 登録成功時に呼び出すコールバック
        this.onRegistrationFailure = null // 登録失敗時に呼び出すコールバック

        this.setupEventListeners()
    }

    /**
     * モーダルを開いて矩形登録、削除プロセスを開始。
     * 成功、失敗、キャンセルの各シナリオに基づいて適切な処理を行い、
     * Promise を通じて結果を返す。
     *
     * @param {Object} targetRect - 処理対象の矩形データ。必要な矩形の情報を含むオブジェクト。
     * @returns {Promise<Object>}
     * 登録、削除が成功した場合、更新された矩形データを返す。
     * 登録、削除が失敗した場合、エラーを返す。
     * 登録、削除がキャンセルされた場合、矩形データを返す。
     */
    start(targetRect) {
        this.rect = targetRect
        this.openModal(this.actionSelectionModal)

        return new Promise((resolve, reject) => {
            this.onRegistrationSuccess = () => resolve(this.rect)
            this.onRegistrationFailure = (error) => reject(error)
        })
    }

    //
    // EventListener
    //
    setupEventListeners() {
        // アクション選択
        this.actionSelectionCancelBtn.addEventListener('click', () => this.handleRegistrationCancel())
        this.actionSelectionNextBtn.addEventListener('click', () => this.handleNext())
        this.setupSelectionTypeListeners()
        // 部位番号登録
        this.partNumberCancelBtn.addEventListener('click', () => this.handleModalClose(this.partNumberModal))
        this.partNumberRegisterBtn.addEventListener('click', () => this.handlePartNumberRegister())
        this.partNumberInput.addEventListener('input', () => {
            this.handleRegisterBtnEnable(this.partNumberInput, this.partNumberRegisterBtn)
        })
        // 遷移先画像登録
        this.transitionImageCancelBtn.addEventListener('click', () => this.handleModalClose(this.transitionImageModal))
        this.transitionImageRegisterBtn.addEventListener('click', () => this.handleTransitionImageRegister())
        this.transitionImageInput.addEventListener('input', () => {
            this.handleRegisterBtnEnable(this.transitionImageInput, this.transitionImageRegisterBtn)
        })
    }

    // 登録キャンセル時の処理
    handleRegistrationCancel() {
        this.resetActionSelectionModal()
        this.closeAllModals()
        if (this.onRegistrationSuccess) this.onRegistrationSuccess()
    }

    // アクション選択モーダルでアクションを選択後、次へボタンを押した後の処理
    // - 部位番号登録モーダルを開く
    // - 遷移先画像登録モーダルを開く
    // - 矩形を削除
    handleNext() {
        const selectionType = this.actionSelectionModal.querySelector('input[name="selection-type"]:checked').value
        if (selectionType === 'part-number') {
            this.handleModalOpen(this.partNumberModal)
        } else if (selectionType === 'transition-image') {
            this.handleModalOpen(this.transitionImageModal)
        } else if (selectionType === 'delete-rect') {
            this.handleRectDelete()
        }
    }

    // ラジオボタンの選択状態に応じて「次へ」ボタンを有効化する
    setupSelectionTypeListeners() {
        const selectionInputs = this.actionSelectionModal.querySelectorAll('input[name="selection-type"]')
        selectionInputs.forEach(input => {
            input.addEventListener('change', () => this.handleNextBtnEnable())
        })
    }

    handleNextBtnEnable() {
        if (document.querySelector('input[name="selection-type"]:checked')) {
            this.actionSelectionNextBtn.disabled = false
        } else {
            this.actionSelectionNextBtn.disabled = true
        }
    }

    handleModalOpen(targetModal) {
        this.openModal(targetModal)
    }

    handleModalClose(targetModal) {
        this.closeModal(targetModal)
    }

    // 部位番号登録モーダル ＆ 遷移先画像登録モーダル
    // 入力の有無に応じて登録ボタンの有効/無効を切り替える
    handleRegisterBtnEnable(inputElement, buttonElement) {
        if (inputElement.value.trim() !== '') {
            buttonElement.disabled = false
        } else {
            buttonElement.disabled = true
        }
    }

    // 部位番号の登録
    handlePartNumberRegister() {
        try {
            console.log('部位番号を登録する矩形', this.rect)
            // TODO: this.rect を利用して、部位番号登録 API 叩く

            this.updateRegisteredStatus('partNumber')
            this.processRegistrationSuccess()
        } catch (err) {
            console.error('部位番号の登録失敗')
            this.processRegistrationFailure(err)
        }
    }

    // 遷移先画像の登録
    handleTransitionImageRegister() {
        try {
            console.log('遷移先画像を登録する矩形', this.rect)
            // TODO: this.rect を利用(?)して、遷移先画像登録 API 叩く

            this.updateRegisteredStatus('transitionImage')
            this.processRegistrationSuccess()
        } catch (err) {
            console.error('遷移先画像の登録失敗', err)
            this.processRegistrationFailure(err)
        }
    }

    // 矩形の削除
    handleRectDelete() {
        try {
            console.log('削除する矩形', this.rect)
            // TODO: this.rect を利用して、矩形削除 APIを叩く

            this.updateDeletedStatus()
            this.processRegistrationSuccess()
        } catch (err) {
            console.error('矩形削除失敗', err)
            this.processRegistrationFailure(err)
        }
    }

    //
    // モーダル開閉
    //
    openModal(targetModal) {
        this.modals.forEach(modal => {
            if (modal === targetModal) {
                modal.style.display = 'block'
                modal.classList.remove('inactive')
            } else {
                modal.classList.add('inactive')
            }
        })
    }

    closeModal(targetModal) {
        targetModal.style.display = 'none'
        this.modals.forEach(modal => modal.classList.remove('inactive'))
    }

    closeAllModals() {
        this.closeModal(this.partNumberModal)
        this.closeModal(this.transitionImageModal)
        this.closeModal(this.actionSelectionModal)
    }

    //
    // ステート管理
    //
    // 登録ステータスを更新する関数
    updateRegisteredStatus(type) {
        if (type === 'partNumber') {
            this.rect.partNumberRegistered = true
        } else if (type === 'transitionImage') {
            this.rect.transitionImageRegistered = true
        }
    }

    // 削除ステータスを更新する関数
    updateDeletedStatus() {
        this.rect.deleted = true
    }

    //
    // 登録後の処理
    //
    // 登録成功後の処理
    processRegistrationSuccess() {
        this.resetPartNumberModal()
        this.resetTransitionImageModal()
        this.resetActionSelectionModal()
        this.closeAllModals()
        if (this.onRegistrationSuccess) this.onRegistrationSuccess()
    }

    // 登録失敗後の処理
    processRegistrationFailure(err) {
        if (this.onRegistrationFailure) this.onRegistrationFailure(err)
    }

    //
    // モーダル内の入力値のクリア
    //
    resetActionSelectionModal() {
        // ラジオボタンの選択を解除
        this.actionSelectionModal.querySelectorAll('input[name="selection-type"]').forEach(radio => {
            radio.checked = false
        })

        // 次へボタンを無効化
        this.actionSelectionNextBtn.disabled = true
    }

    resetPartNumberModal() {
        // テキスト入力フィールドをクリア
        this.partNumberInput.value = ''
    }

    resetTransitionImageModal() {
        // テキスト入力フィールドをクリア
        this.transitionImageInput.value = ''
    }
}
