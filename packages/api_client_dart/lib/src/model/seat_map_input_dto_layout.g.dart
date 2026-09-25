// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'seat_map_input_dto_layout.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SeatMapInputDtoLayout extends SeatMapInputDtoLayout {
  @override
  final BuiltList<SeatMapInputDtoLayoutDecksInner> decks;

  factory _$SeatMapInputDtoLayout(
          [void Function(SeatMapInputDtoLayoutBuilder)? updates]) =>
      (SeatMapInputDtoLayoutBuilder()..update(updates))._build();

  _$SeatMapInputDtoLayout._({required this.decks}) : super._();
  @override
  SeatMapInputDtoLayout rebuild(
          void Function(SeatMapInputDtoLayoutBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SeatMapInputDtoLayoutBuilder toBuilder() =>
      SeatMapInputDtoLayoutBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SeatMapInputDtoLayout && decks == other.decks;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, decks.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SeatMapInputDtoLayout')
          ..add('decks', decks))
        .toString();
  }
}

class SeatMapInputDtoLayoutBuilder
    implements Builder<SeatMapInputDtoLayout, SeatMapInputDtoLayoutBuilder> {
  _$SeatMapInputDtoLayout? _$v;

  ListBuilder<SeatMapInputDtoLayoutDecksInner>? _decks;
  ListBuilder<SeatMapInputDtoLayoutDecksInner> get decks =>
      _$this._decks ??= ListBuilder<SeatMapInputDtoLayoutDecksInner>();
  set decks(ListBuilder<SeatMapInputDtoLayoutDecksInner>? decks) =>
      _$this._decks = decks;

  SeatMapInputDtoLayoutBuilder() {
    SeatMapInputDtoLayout._defaults(this);
  }

  SeatMapInputDtoLayoutBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _decks = $v.decks.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SeatMapInputDtoLayout other) {
    _$v = other as _$SeatMapInputDtoLayout;
  }

  @override
  void update(void Function(SeatMapInputDtoLayoutBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SeatMapInputDtoLayout build() => _build();

  _$SeatMapInputDtoLayout _build() {
    _$SeatMapInputDtoLayout _$result;
    try {
      _$result = _$v ??
          _$SeatMapInputDtoLayout._(
            decks: decks.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'decks';
        decks.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'SeatMapInputDtoLayout', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
